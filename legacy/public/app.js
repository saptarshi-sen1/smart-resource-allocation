import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Volunteer form
const volunteerForm = document.getElementById("volunteerForm");

volunteerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const skillsInput = document.getElementById("skills").value;
  const location = document.getElementById("location").value;
  const availability = document.getElementById("availability").value;


  // Geo fields and verification
  const latitude = parseFloat(document.getElementById("latitude").value);
  const longitude = parseFloat(document.getElementById("longitude").value);
  const verified = document.getElementById("verified").checked;

  try {
    const docRef = await addDoc(collection(db, "volunteers"), {
      name,
      skills,
      location,
      availability,
      latitude: isNaN(latitude) ? null : latitude,
      longitude: isNaN(longitude) ? null : longitude,
      verified,
      createdAt: new Date().toISOString()
    });
    alert("Volunteer added successfully! ID: " + docRef.id);
    volunteerForm.reset();
  } catch (error) {
    console.error("Error adding volunteer:", error);
    alert("Error adding volunteer. Check console.");
  }
});

// NGO request form
const requestForm = document.getElementById("requestForm");

requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();


  const needType = document.getElementById("needType").value;
  const location = document.getElementById("requestLocation").value;
  const urgency = document.getElementById("urgency").value;
  const peopleAffected = parseInt(document.getElementById("peopleAffected").value);
  const latitude = parseFloat(document.getElementById("requestLatitude").value);
  const longitude = parseFloat(document.getElementById("requestLongitude").value);
  const verified = document.getElementById("requestVerified").checked;

  // --- Gemini API Placeholder for AI-based classification ---
  // You can call Gemini API here with the needType or a free-text description
  // Example:
  // const geminiApiKey = "YOUR_GEMINI_API_KEY"; // Load from .env in backend or inject at build
  // const geminiResult = await fetchGeminiClassification(needType, geminiApiKey);
  // let structuredNeedType = geminiResult.structuredNeedType;
  // For now, use needType directly

  // --- Hybrid Urgency Scoring ---
  function calculateUrgencyScore({ urgency, peopleAffected }) {
    let score = 0;
    if (urgency === "High") score += 50;
    else if (urgency === "Medium") score += 30;
    else if (urgency === "Low") score += 10;
    if (!isNaN(peopleAffected)) {
      if (peopleAffected >= 100) score += 40;
      else if (peopleAffected >= 50) score += 25;
      else if (peopleAffected >= 10) score += 10;
      else score += 5;
    }
    return score;
  }
  const urgencyScore = calculateUrgencyScore({ urgency, peopleAffected });

  try {
    const docRef = await addDoc(collection(db, "requests"), {
      needType,
      location,
      urgency,
      peopleAffected,
      latitude: isNaN(latitude) ? null : latitude,
      longitude: isNaN(longitude) ? null : longitude,
      verified,
      urgencyScore,
      status: "new",
      createdAt: new Date().toISOString()
    });
    alert("Request added successfully! ID: " + docRef.id);
    requestForm.reset();
  } catch (error) {
    console.error("Error adding request:", error);
    alert("Error adding request. Check console.");
  }
});

// --- Multi-source Data Ingestion (CSV/JSON upload) ---
// Example for volunteers (add similar for requests if needed)
const volunteerUpload = document.createElement("input");
volunteerUpload.type = "file";
volunteerUpload.accept = ".csv,.json";
volunteerUpload.style.margin = "10px 0";
volunteerForm.appendChild(volunteerUpload);

volunteerUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (event) => {
    let data = [];
    if (file.name.endsWith(".json")) {
      data = JSON.parse(event.target.result);
    } else if (file.name.endsWith(".csv")) {
      // Simple CSV parser (assumes header row)
      const lines = event.target.result.split("\n");
      const headers = lines[0].split(",").map(h => h.trim());
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",");
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = values[idx] ? values[idx].trim() : ""; });
        data.push(obj);
      }
    }
    // Ingest data
    for (const v of data) {
      try {
        await addDoc(collection(db, "volunteers"), {
          name: v.name || "",
          skills: v.skills ? v.skills.split(",").map(s => s.trim()) : [],
          location: v.location || "",
          availability: v.availability || "",
          latitude: v.latitude ? parseFloat(v.latitude) : null,
          longitude: v.longitude ? parseFloat(v.longitude) : null,
          verified: v.verified === "true" || v.verified === true,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error ingesting volunteer:", err);
      }
    }
    alert("Volunteer data uploaded and ingested!");
    volunteerUpload.value = "";
  };
  reader.readAsText(file);
});

// Run matching
const runMatchingBtn = document.getElementById("runMatchingBtn");

runMatchingBtn.addEventListener("click", async () => {
  try {
    const requestsRef = collection(db, "requests");
    const latestRequestQuery = query(
      requestsRef,
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const requestSnapshot = await getDocs(latestRequestQuery);

    if (requestSnapshot.empty) {
      alert("No requests found.");
      return;
    }

    const requestDoc = requestSnapshot.docs[0];
    const requestId = requestDoc.id;
    const requestData = requestDoc.data();

    const volunteersSnapshot = await getDocs(collection(db, "volunteers"));

    if (volunteersSnapshot.empty) {
      alert("No volunteers found.");
      return;
    }

    let matchCount = 0;

    for (const volunteerDoc of volunteersSnapshot.docs) {
      const volunteerId = volunteerDoc.id;
      const volunteerData = volunteerDoc.data();

      let score = 0;

      const needType = (requestData.needType || "").toLowerCase();
      const volunteerSkills = (volunteerData.skills || []).map(skill =>
        skill.toLowerCase()
      );
      const requestLocation = (requestData.location || "").toLowerCase();
      const volunteerLocation = (volunteerData.location || "").toLowerCase();
      const availability = (volunteerData.availability || "").toLowerCase();

      if (volunteerSkills.includes(needType)) {
        score += 5;
      }

      if (volunteerLocation === requestLocation) {
        score += 3;
      }

      if (availability === "available") {
        score += 2;
      }

      if (score > 0) {
        const duplicateQuery = query(
          collection(db, "matches"),
          where("requestId", "==", requestId),
          where("volunteerId", "==", volunteerId)
        );

        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (duplicateSnapshot.empty) {
          await addDoc(collection(db, "matches"), {
            requestId: requestId,
            volunteerId: volunteerId,
            volunteerName: volunteerData.name || "Unknown Volunteer",
            volunteerLocation: volunteerData.location || "Unknown Location",
            needType: requestData.needType || "Unknown Need",
            requestLocation: requestData.location || "Unknown Location",
            score: score,
            status: "pending",
            createdAt: new Date().toISOString()
          });

          matchCount++;
        }
      }
    }

    alert(`Matching complete! ${matchCount} new match(es) saved.`);
  } catch (error) {
    console.error("Error running matching:", error);
    alert("Error running matching. Check console.");
  }
});

// Show top 3 matches
const showMatchesBtn = document.getElementById("showMatchesBtn");
const matchesList = document.getElementById("matchesList");

showMatchesBtn.addEventListener("click", async () => {
  try {
    matchesList.innerHTML = "";

    const matchesQuery = query(
      collection(db, "matches"),
      orderBy("score", "desc"),
      limit(3)
    );

    const matchesSnapshot = await getDocs(matchesQuery);

    if (matchesSnapshot.empty) {
      matchesList.innerHTML = "<li>No matches found.</li>";
      return;
    }

    matchesSnapshot.forEach((doc) => {
      const match = doc.data();

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Volunteer Name:</strong> ${match.volunteerName || "Not available"} <br>
        <strong>Volunteer Location:</strong> ${match.volunteerLocation || "Not available"} <br>
        <strong>Need Type:</strong> ${match.needType || "Not available"} <br>
        <strong>Request Location:</strong> ${match.requestLocation || "Not available"} <br>
        <strong>Score:</strong> ${match.score} <br>
        <strong>Status:</strong> ${match.status}
      `;

      matchesList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    alert("Error fetching matches. Check console.");
  }
});