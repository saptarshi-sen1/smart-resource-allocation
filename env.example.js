// ─────────────────────────────────────────────────────────────────────────────
// env.js — Client-side configuration (COPY THIS FILE, rename to env.js)
//
// 1. Copy this file: cp env.example.js env.js
// 2. Fill in your own API keys below
// 3. env.js is gitignored — never commit it
// ─────────────────────────────────────────────────────────────────────────────
export const ADMIN_EMAILS = [
  "admin@crisisconnect.org"
];

export const ADMIN_PASSWORDS = [
  "Admin@1234!"
];

// Gemini API key
export const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

// OpenRouter API Key — used for AI Vision OCR
// Get your key at: https://openrouter.ai/keys
export const OPENROUTER_API_KEY = "YOUR_OPENROUTER_API_KEY_HERE";

// OpenRouter Vision model to use for OCR
// Free options: "meta-llama/llama-3.2-11b-vision-instruct:free"
//               "qwen/qwen2.5-vl-7b-instruct:free"
export const OPENROUTER_OCR_MODEL = "meta-llama/llama-3.2-11b-vision-instruct:free";
