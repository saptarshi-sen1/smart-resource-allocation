/**
 * AI Vision OCR Integration for CrisisConnect
 *
 * Flow:
 *  1. Extract raw text from the uploaded file:
 *     - Images  → OpenRouter vision LLM (or Tesseract.js as fallback)
 *     - PDFs    → PDF.js text extraction  (or Tesseract.js on each page image as fallback)
 *  2. Send raw text to Gemini API for classification & scoring
 *  3. Return structured result: { rawText, source, parsed }
 */

import { OPENROUTER_API_KEY, OPENROUTER_OCR_MODEL, GEMINI_API_KEY } from "./env.js";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const OCR_VISION_PROMPT = `You are an expert OCR engine specialized in extracting text from disaster relief field documents, survey forms, and emergency reports.

Your task:
1. Extract ALL visible text from the image exactly as it appears.
2. Preserve the original structure (headings, labels, lists, tables) using plain text.
3. Do NOT summarize, paraphrase, or omit any part of the text.
4. Return ONLY the extracted text — no commentary, no preamble.`;

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main entry point — extracts text from file, then classifies via Gemini.
 * @param {File|Blob} file  — image (any format) or PDF
 * @param {'openrouter_api'|'local_model'} mode
 * @returns {{ rawText: string, source: string, parsed: object }}
 */
export async function recognizeText(file, mode = "openrouter_api") {
  const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");

  let rawText = "";
  let ocrSource = "";

  if (isPdf) {
    // ── PDF path ──────────────────────────────────────────────────────────
    try {
      const result = await extractTextFromPdf(file);
      rawText = result.text;
      ocrSource = result.source;
    } catch (err) {
      console.warn("PDF extraction failed:", err.message);
      rawText = `[PDF text extraction failed: ${err.message}]`;
      ocrSource = "PDF.js (failed)";
    }
  } else {
    // ── Image path ────────────────────────────────────────────────────────
    const useApi =
      mode === "openrouter_api" &&
      OPENROUTER_API_KEY &&
      !OPENROUTER_API_KEY.includes("YOUR_");

    if (useApi) {
      try {
        const result = await extractTextWithOpenRouter(file);
        rawText = result.text;
        ocrSource = result.source;
      } catch (err) {
        console.warn("OpenRouter OCR failed, falling back to Tesseract:", err.message);
        const result = await extractTextWithTesseract(file);
        rawText = result.text;
        ocrSource = result.source + " (OpenRouter fallback)";
      }
    } else {
      // Local mode or no API key — use Tesseract
      const result = await extractTextWithTesseract(file);
      rawText = result.text;
      ocrSource = result.source;
    }
  }

  // ── Step 2: Classify with Gemini ────────────────────────────────────────
  let parsed;
  if (rawText && rawText.length > 10 && GEMINI_API_KEY && !GEMINI_API_KEY.includes("YOUR_")) {
    try {
      parsed = await classifyWithGemini(rawText);
    } catch (err) {
      console.warn("Gemini classification failed, using regex fallback:", err.message);
      parsed = parseDisasterSurveyText(rawText);
    }
  } else {
    parsed = parseDisasterSurveyText(rawText);
  }

  return {
    rawText: rawText || "(No text extracted)",
    source: ocrSource,
    parsed
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1a: OpenRouter Vision LLM — extract text from image
// ─────────────────────────────────────────────────────────────────────────────
async function extractTextWithOpenRouter(imageFile) {
  const dataUrl = await fileToBase64(imageFile);

  const payload = {
    model: OPENROUTER_OCR_MODEL,
    messages: [
      { role: "system", content: OCR_VISION_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" }
          },
          {
            type: "text",
            text: "Extract all text from this document image."
          }
        ]
      }
    ],
    max_tokens: 2048,
    temperature: 0.1
  };

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "CrisisConnect OCR Studio"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

  const text = data.choices?.[0]?.message?.content?.trim() || "";
  if (!text) throw new Error("Empty response from OpenRouter");

  return { text, source: `AI Vision OCR (${OPENROUTER_OCR_MODEL})` };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1b: Tesseract.js — offline image OCR fallback
// ─────────────────────────────────────────────────────────────────────────────
async function extractTextWithTesseract(imageFile) {
  if (typeof Tesseract === "undefined") {
    // Dynamically load Tesseract if not already present
    await loadScript("https://unpkg.com/tesseract.js@4/dist/tesseract.min.js");
  }
  const result = await Tesseract.recognize(imageFile, "eng", {
    logger: () => {} // silence progress logs
  });
  const text = result.data.text?.trim() || "";
  return { text, source: "Tesseract.js (Local OCR)" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1c: PDF.js — extract embedded text from PDF files
// ─────────────────────────────────────────────────────────────────────────────
async function extractTextFromPdf(pdfFile) {
  // Load PDF.js CDN if not already present
  if (typeof pdfjsLib === "undefined") {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs", true);
    // Wait a tick for pdfjsLib to initialise
    await new Promise(r => setTimeout(r, 300));
  }

  if (typeof pdfjsLib === "undefined") {
    throw new Error("PDF.js failed to load — cannot extract text from PDF.");
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs";

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }

  return {
    text: fullText.trim(),
    source: `PDF.js (${pdf.numPages} page${pdf.numPages !== 1 ? "s" : ""})`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Gemini API — classify extracted text
// ─────────────────────────────────────────────────────────────────────────────
async function classifyWithGemini(rawText) {
  // Truncate to ~3000 chars to stay within token limits
  const truncated = rawText.length > 3000
    ? rawText.slice(0, 3000) + "\n...[truncated]"
    : rawText;

  const prompt = `You are an AI assistant for a disaster relief platform. You have been given raw extracted text from a field survey document or emergency report.

Your task is to:
1. Summarize the key information concisely (1-2 sentences).
2. Classify the primary need type.
3. Estimate urgency level.
4. Extract the number of people affected (if mentioned).
5. Extract the location (if mentioned).
6. Assign a priority score (0-1000) based on urgency, scale of impact, and criticality.

Extracted Document Text:
"""
${truncated}
"""

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "needType": "<one of: Food & Water | Medical & First Aid | Emergency Shelter | Search & Rescue | Logistics & Transport | Other>",
  "urgency": "<High | Medium | Low>",
  "peopleAffected": <integer, 0 if not mentioned>,
  "location": "<location string or empty string>",
  "description": "<1-2 sentence summary of what help is needed>",
  "priorityScore": <integer 0-1000>,
  "priorityLabel": "<CRITICAL | URGENT | ELEVATED | NORMAL>"
}`;

  const res = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
    })
  });

  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);

  const data = await res.json();
  const rawResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip possible markdown code fences
  const jsonStr = rawResponse.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

  try {
    const parsed = JSON.parse(jsonStr);
    // Validate required fields exist
    return {
      needType: parsed.needType || "Other",
      urgency: parsed.urgency || "Medium",
      peopleAffected: parseInt(parsed.peopleAffected) || 0,
      location: parsed.location || "",
      description: parsed.description || rawText.slice(0, 250),
      priorityScore: parseInt(parsed.priorityScore) || 100,
      priorityLabel: parsed.priorityLabel || "NORMAL"
    };
  } catch {
    throw new Error("Gemini returned invalid JSON: " + jsonStr.slice(0, 200));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Regex-based fallback parser (when Gemini is unavailable)
// ─────────────────────────────────────────────────────────────────────────────
export function parseDisasterSurveyText(text) {
  const t = (text || "").toLowerCase();

  let needType = "Food & Water";
  if (t.includes("medical") || t.includes("doctor") || t.includes("injury") || t.includes("health") || t.includes("medicine")) {
    needType = "Medical & First Aid";
  } else if (t.includes("shelter") || t.includes("tent") || t.includes("blanket") || t.includes("homeless")) {
    needType = "Emergency Shelter";
  } else if (t.includes("rescue") || t.includes("trapped") || t.includes("evacuation") || t.includes("boat")) {
    needType = "Search & Rescue";
  } else if (t.includes("transport") || t.includes("logistics") || t.includes("supply chain")) {
    needType = "Logistics & Transport";
  }

  let urgency = "Medium";
  if (t.includes("critical") || t.includes("urgent") || t.includes("immediate") || t.includes("emergency") || t.includes("high")) {
    urgency = "High";
  } else if (t.includes("low") || t.includes("stable")) {
    urgency = "Low";
  }

  let location = "";
  const locMatch = text.match(/location[:\-]?\s*([^\n\r]+)/i);
  if (locMatch?.[1]) location = locMatch[1].trim().slice(0, 100);

  let peopleAffected = 0;
  const peopleMatch =
    text.match(/(?:people|affected|victims|families)[:\-]?\s*(\d+)/i) ||
    text.match(/(\d+)\s*(?:people|affected|persons|families)/i);
  if (peopleMatch?.[1]) peopleAffected = parseInt(peopleMatch[1], 10);

  let description = (text || "").slice(0, 300);
  const descMatch = text.match(/description[:\-]?\s*([^\n\r]+)/i);
  if (descMatch?.[1]) description = descMatch[1].trim();

  const priorityScore = urgency === "High" ? 400 : urgency === "Medium" ? 200 : 80;
  const priorityLabel = priorityScore >= 400 ? "URGENT" : priorityScore >= 200 ? "ELEVATED" : "NORMAL";

  return { needType, urgency, location, peopleAffected, description, priorityScore, priorityLabel };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function loadScript(src, isModule = false) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    if (isModule) script.type = "module";
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Legacy export alias — keeps old code from breaking
export function configureBaiduOcr() {}
