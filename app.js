import { db, auth, googleProvider } from "./firebase.js";
import { ADMIN_EMAILS, ADMIN_PASSWORDS, GEMINI_API_KEY } from "./env.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  setDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Normalise admin emails for case-insensitive comparison
const ADMIN_EMAILS_LOWER = ADMIN_EMAILS.map(e => e.toLowerCase());


// ─── State ──────────────────────────────────────────────────────────────────
let currentUser = null;
let currentRole = null;
let allAdminMatches = [];
let adminMap = null;
let heatLayer = null;
const TOP_N = 3;
let adminShowAll = false;
let ngoAllMatches = [];
let ngoShowAll = false;
let volAllMatches = [];
let volShowAll = false;

// ─── Gemini API Integration ──────────────────────────────────────────────────
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function verifyRequestWithAI(needType, description) {
  const prompt = `You are a verification assistant for a disaster relief platform.
Analyze this NGO resource request and determine if it is genuine, credible, and relates to a real humanitarian need.

Need Type: "${needType}"
Description: "${description}"

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "verified": true or false,
  "score": <integer 0-100 representing genuineness>,
  "reason": "<one sentence explaining your decision>",
  "summary": "<one sentence summarizing what help is actually needed>"
}

Rules:
- Set verified=false if: the description is too vague, suspicious, contains spam/scam language, is nonsensical, or seems like a test.
- Set verified=true if: it describes a clear, plausible humanitarian need with location or context details.
- Score should reflect confidence in genuineness (0=definitely fake, 100=clearly genuine).`;

  try {
    const res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
      })
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonText);

    return {
      verified: !!parsed.verified,
      score: parsed.score ?? 50,
      reason: parsed.reason || "Gemini analysis complete.",
      summary: parsed.summary || ""
    };
  } catch (err) {
    console.warn("Gemini verification failed, using fallback:", err.message);
    // Fallback: basic heuristic if API fails
    const wordCount = description.trim().split(/\s+/).length;
    const suspicious = ["test","fake","lorem","scam","xxx","asdf"].some(kw =>
      description.toLowerCase().includes(kw)
    );
    if (suspicious || wordCount < 5 || description.length < 30) {
      return { verified: false, score: 10, reason: "Flagged by fallback checks.", summary: "" };
    }
    return { verified: true, score: 60, reason: "Gemini unavailable; passed basic checks.", summary: description.slice(0, 100) };
  }
}


// ─── Helpers ────────────────────────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll(".role-dashboard").forEach(s => s.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function setView(view) {
  const authSection = document.getElementById("auth-section");
  const appSection = document.getElementById("app-section");
  const overlay = document.getElementById("loading-overlay");

  if (view === "auth") {
    authSection.classList.remove("hidden");
    authSection.classList.add("active");
    appSection.classList.add("hidden");
    if (overlay) overlay.classList.add("hidden");
  } else {
    authSection.classList.add("hidden");
    authSection.classList.remove("active");
    appSection.classList.remove("hidden");
    if (overlay) overlay.classList.add("hidden");
  }

}

function setGeoOnClick(latId, lngId) {
  if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      document.getElementById(latId).value = pos.coords.latitude.toFixed(6);
      document.getElementById(lngId).value = pos.coords.longitude.toFixed(6);
    },
    () => alert("Could not get location. Please allow GPS access.")
  );
}

// ─── Render helpers ──────────────────────────────────────────────────────────
function renderMatchList(listId, showMoreBtnId, items, showAll) {
  const list = document.getElementById(listId);
  const showMoreBtn = document.getElementById(showMoreBtnId);
  if (!list) return;

  const toShow = showAll ? items : items.slice(0, TOP_N);
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = "<li class='empty-state'>No matches found.</li>";
    if (showMoreBtn) showMoreBtn.classList.add("hidden");
    return;
  }

  toShow.forEach(m => {
    const li = document.createElement("li");
    li.className = "match-item";

    let volStatus = m.volunteerAvailability || "N/A";
    if (m.volunteerLastLogin) {
      const days = (new Date() - new Date(m.volunteerLastLogin)) / (1000 * 60 * 60 * 24);
      if (days > 30) {
        volStatus = "Inactive (>30 days)";
      }
    }
    const statusColor = volStatus.toLowerCase().includes('inactive') || volStatus.toLowerCase().includes('busy') ? 'var(--danger)' : 'var(--secondary)';

    li.innerHTML = `
      <div class="match-info">
        <div class="tooltip"><strong>${m.volunteerName || "N/A"}</strong><span class="tooltiptext">Email: ${m.volunteerEmail || 'N/A'}</span></div><br>
        <small>${m.volunteerLocation || ""}</small><br>
        <small>Status: <span style="color: ${statusColor}; font-weight: bold;">${volStatus}</span></small>
      </div>
      <div class="match-info">
        <div class="tooltip"><strong>${m.needType || "N/A"}</strong><span class="tooltiptext">NGO Email: ${m.ngoEmail || 'N/A'}</span></div><br>
        <small>${m.requestLocation || ""}</small>
      </div>
      <div class="match-score">
        <span class="badge ${m.type === 'Manual' ? 'badge-active' : 'badge-pending'}">${m.manualLabel || 'Score: ' + (m.score ?? 'N/A')}</span><br>
        <small>${m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ""}</small>
        <div style="margin-top: 5px;">
           <a href="mailto:${m.volunteerEmail || m.ngoEmail || ''}" target="_blank"><button class="btn secondary-btn" style="padding: 4px 8px; font-size: 0.8rem; margin: 0;">Contact</button></a>
           ${currentRole === 'Admin' ? `<button class="btn" style="padding: 4px 8px; font-size: 0.8rem; margin: 0; background: var(--danger); color: white; border:none;" onclick="window.deleteMatch('${m.id}', '${m.type}')">Remove</button>` : ''}
        </div>
      </div>
    `;
    list.appendChild(li);
  });

  if (showMoreBtn) {
    if (items.length > TOP_N) {
      showMoreBtn.classList.remove("hidden");
      showMoreBtn.textContent = showAll
        ? "Show Less"
        : `Show All ${items.length} Matches`;
    } else {
      showMoreBtn.classList.add("hidden");
    }
  }
}

// ─── Auth Flow ──────────────────────────────────────────────────────────────
async function logActivity(uid, action, details) {
  try {
    await addDoc(collection(db, "history"), {
      uid,
      action,
      details,
      timestamp: new Date().toISOString(),
      role: currentRole
    });
  } catch (e) { console.error("Failed to log activity:", e); }
}

async function loadHistory(uid, timelineId) {
  const container = document.querySelector(`#${timelineId} .timeline-container`);
  if (!container) return;
  
  try {
    const q = query(
      collection(db, "history"),
      where("uid", "==", uid),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      container.innerHTML = '<div class="timeline-item"><p>No activity recorded yet.</p></div>';
      return;
    }
    
    container.innerHTML = "";
    snap.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "timeline-item";
      div.innerHTML = `
        <h3>${data.action}</h3>
        <p>${data.details}</p>
        <small>${new Date(data.timestamp).toLocaleString()}</small>
      `;
      container.appendChild(div);
    });
  } catch (e) { console.error("Failed to load history:", e); }
}

async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : null;
}

async function saveUserRole(uid, email, role) {
  await setDoc(doc(db, "users", uid), { email, role }, { merge: true });
}

async function handleAuthSuccess(user, roleOverride) {
  const overlay = document.getElementById("loading-overlay");
  try {
    currentUser = user;
    let role = roleOverride || await getUserRole(user.uid);

    const isAdmin = ADMIN_EMAILS_LOWER.includes((user.email || "").toLowerCase());
    if (isAdmin) role = "Admin";
    if (!role) role = "Volunteer";
    currentRole = role;

    // Update last login
    try {
      await setDoc(doc(db, "users", user.uid), { lastLogin: new Date().toISOString() }, { merge: true });
    } catch (e) { console.warn("Could not update user login time", e); }
    
    const badge = document.getElementById("userRoleBadge");
    if (badge) badge.textContent = role;
    
    // Populate Navigation Links
    const navLinks = document.getElementById("dashboard-nav");
    if (navLinks) {
      navLinks.innerHTML = "";
      const links = {
        "Volunteer": [
          { name: "My Profile", target: "volunteer-dashboard" },
          { name: "History", target: "volunteerTimeline" }
        ],
        "NGO": [
          { name: "Requests", target: "ngo-dashboard" },
          { name: "Scanned", target: "ocr-scan-section" },
          { name: "History", target: "ngoTimeline" }
        ],
        "Admin": [
          { name: "Overview", target: "admin-dashboard" },
          { name: "Matches", target: "admin-matches-section" },
          { name: "History", target: "adminTimeline" }
        ]
      };
      
      (links[role] || []).forEach(l => {
        const a = document.createElement("a");
        a.className = "nav-link";
        a.textContent = l.name;
        a.onclick = () => {
          document.querySelectorAll(".nav-link").forEach(nl => nl.classList.remove("active"));
          a.classList.add("active");
          const targetEl = document.getElementById(l.target);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          
          // Toggle timeline visibility if clicked
          if (l.target.toLowerCase().includes('timeline')) {
            document.querySelectorAll('.timeline').forEach(t => t.classList.add('hidden'));
            if (targetEl) targetEl.classList.remove('hidden');
          }
        };
        navLinks.appendChild(a);
      });
    }

    setView("app");

    if (role === "Admin") {
      showSection("admin-dashboard");
      loadAdminMatches();
      renderCharts();
      loadHistory(user.uid, "adminTimeline");
    } else if (role === "NGO") {
      showSection("ngo-dashboard");
      loadNgoMatches();
      initNgoDashboard();
      loadHistory(user.uid, "ngoTimeline");
    } else {
      showSection("volunteer-dashboard");
      loadVolMatches();
      prefillVolunteerForm();
      loadHistory(user.uid, "volunteerTimeline");
    }
    
    // Log login
    logActivity(user.uid, "Login", "Successfully signed into the dashboard.");

  } catch (err) {
    console.error("Auth success handler failed:", err);
    alert("Authentication error. Please try logging in again.");
    setView("auth");
  } finally {
    if (overlay) overlay.classList.add("hidden");
  }
}

// Email/Password Login
document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Check admin credentials first (hardcoded)
  const adminIdx = ADMIN_EMAILS_LOWER.indexOf(email.toLowerCase());
  if (adminIdx !== -1) {
    if (ADMIN_PASSWORDS[adminIdx] !== password) {
      alert("Invalid admin password.");
      return;
    }
    // Try sign in first; if account doesn't exist in Firebase yet, auto-create it
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, email, password);
    } catch (signInErr) {
      const code = signInErr.code;
      if (
        code === "auth/user-not-found" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-email" ||
        code === "auth/wrong-password"
      ) {
        // Account doesn't exist yet — create it automatically
        try {
          cred = await createUserWithEmailAndPassword(auth, email, password);
        } catch (createErr) {
          alert("Failed to create admin account: " + createErr.message);
          return;
        }
      } else {
        alert("Admin login failed: " + signInErr.message);
        return;
      }
    }
    await saveUserRole(cred.user.uid, email, "Admin");
    await handleAuthSuccess(cred.user, "Admin");
    return;
  }


  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await handleAuthSuccess(cred.user);
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// Email/Password Register
document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const role = document.getElementById("regRole").value;
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Creating Account...";
    await saveUserRole(cred.user.uid, email, role);
    await handleAuthSuccess(cred.user, role);
  } catch (err) {
    console.error("Registration error:", err);
    alert("Registration failed: " + err.message);
  } finally {
    const btn = e.target.querySelector("button[type=submit]");
    if (btn) {
        btn.disabled = false;
        btn.textContent = "Create Account";
    }
  }
});

// Google Login
function handleGoogleError(err) {
  if (
    err.code === "auth/configuration-not-found" ||
    (err.message && err.message.includes("CONFIGURATION_NOT_FOUND"))
  ) {
    alert(
      "Google Sign-In is not enabled yet.\n\n" +
      "To fix this:\n" +
      "1. Go to https://console.firebase.google.com\n" +
      "2. Select your project\n" +
      "3. Click Authentication → Sign-in method\n" +
      "4. Enable 'Google' as a provider\n" +
      "5. Also make sure 'Email/Password' is enabled\n\n" +
      "Then refresh this page and try again."
    );
  } else {
    alert("Google sign-in failed: " + err.message);
  }
}

document.getElementById("googleLoginBtn").addEventListener("click", () => {
  signInWithRedirect(auth, googleProvider);
});

// Google Register
document.getElementById("googleRegBtn").addEventListener("click", () => {
  const role = document.getElementById("regRole").value;
  sessionStorage.setItem("pendingRegistrationRole", role);
  signInWithRedirect(auth, googleProvider);
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  // Sign out from Firebase
  await signOut(auth);
  // Clear any persisted auth data
  try { localStorage.clear(); } catch(e) {}
  try { sessionStorage.clear(); } catch(e) {}
  currentUser = null;
  currentRole = null;
  // Reset auth UI to login view
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
  document.getElementById("showLoginBtn").classList.add("active");
  document.getElementById("showRegisterBtn").classList.remove("active");
  setView("auth");
});

// Auth Tabs Toggle
document.getElementById("showLoginBtn").addEventListener("click", () => {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("registerForm").classList.remove("active");
  document.getElementById("showLoginBtn").classList.add("active");
  document.getElementById("showRegisterBtn").classList.remove("active");
});
document.getElementById("showRegisterBtn").addEventListener("click", () => {
  document.getElementById("registerForm").classList.add("active");
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("showRegisterBtn").classList.add("active");
  document.getElementById("showLoginBtn").classList.remove("active");
});

// ─── Auth Initialization ───────────────────────────────────────────────────
onAuthStateChanged(auth, async user => {
  if (user) {
    await handleAuthSuccess(user);
  } else {
    setView("auth");
  }
});

(async () => {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.classList.remove("hidden");
  
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const pendingRole = sessionStorage.getItem("pendingRegistrationRole");
      if (pendingRole) {
        console.log("Saving pending role:", pendingRole);
        await saveUserRole(result.user.uid, result.user.email, pendingRole);
        sessionStorage.removeItem("pendingRegistrationRole");
        await handleAuthSuccess(result.user, pendingRole);
      }
    }
  } catch (err) {
    console.error("Redirect auth error:", err);
    if (err.code !== 'auth/popup-closed-by-user') {
      alert("Google sign-in failed: " + err.message);
    }
    setView("auth");
  }
})();

// ─── Geolocation Buttons ────────────────────────────────────────────────────
document.getElementById("ngoGetLocationBtn").addEventListener("click", () =>
  setGeoOnClick("requestLat", "requestLng")
);
document.getElementById("volGetLocationBtn").addEventListener("click", () =>
  setGeoOnClick("volLat", "volLng")
);

// ─── NGO Request Form ────────────────────────────────────────────────────────
document.getElementById("requestForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser) { alert("Please log in."); return; }

  const ngoName = document.getElementById("ngoName").value.trim();
  const needType = document.getElementById("needType").value.trim();
  const description = document.getElementById("requestDescription").value.trim();
  const location = document.getElementById("requestLocation").value.trim();
  const latitude = parseFloat(document.getElementById("requestLat").value) || null;
  const longitude = parseFloat(document.getElementById("requestLng").value) || null;
  const urgency = document.getElementById("urgency").value;
  const peopleAffected = parseInt(document.getElementById("peopleAffected").value) || 0;

  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Analyzing & Submitting...";

  const aiResult = await verifyRequestWithAI(needType, description);

  try {
    await addDoc(collection(db, "requests"), {
      ngoName,
      needType,
      description,
      location,
      latitude,
      longitude,
      urgency,
      peopleAffected,
      verified: aiResult.verified,
      aiGenuineness: aiResult.verified ? `${aiResult.score}/100` : "Not Verified",
      aiSummary: aiResult.summary || aiResult.reason,
      status: "new",
      createdAt: new Date().toISOString(),
      submittedBy: currentUser.uid,
      email: currentUser.email || ""
    });

    if (aiResult.verified) {
      alert(`✅ Request submitted!\nAI Verification: PASSED (Score: ${aiResult.score}/100)`);
    } else {
      alert(`⚠️ Request submitted but flagged by AI.\nReason: ${aiResult.reason}\nAn admin will review it.`);
    }
    e.target.reset();
  } catch (err) {
    alert("Error submitting request: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Request";
  }
});

// ─── Volunteer Form ──────────────────────────────────────────────────────────
document.getElementById("volunteerForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser) return;

  const name = document.getElementById("volName").value.trim();
  const skills = document.getElementById("volSkills").value.split(",").map(s => s.trim()).filter(Boolean);
  const location = document.getElementById("volLocation").value.trim();
  const latitude = parseFloat(document.getElementById("volLat").value) || null;
  const longitude = parseFloat(document.getElementById("volLng").value) || null;
  const availability = document.getElementById("volAvailability").value;

  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    // Generate a unique key once; keep existing key if already set
    const existingSnap = await getDoc(doc(db, "volunteers", currentUser.uid));
    const existingKey = existingSnap.exists() ? existingSnap.data().uniqueKey : null;
    const uniqueKey = existingKey || Math.random().toString(36).substr(2, 8).toUpperCase();

    await setDoc(doc(db, "volunteers", currentUser.uid), {
      name, skills, location, latitude, longitude, availability,
      uniqueKey,
      email: currentUser.email || "",
      lastLogin: new Date().toISOString(),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : new Date().toISOString(),
      uid: currentUser.uid
    });
    document.getElementById("volUniqueKey").value = uniqueKey;
    alert("Profile saved!");
  } catch (err) {
    alert("Error saving profile: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Update Profile";
  }
});

async function prefillVolunteerForm() {
  if (!currentUser) return;
  const snap = await getDoc(doc(db, "volunteers", currentUser.uid));

  // Generate and display unique key (create if new)
  let uniqueKey;
  if (snap.exists() && snap.data().uniqueKey) {
    uniqueKey = snap.data().uniqueKey;
  } else {
    uniqueKey = Math.random().toString(36).substr(2, 8).toUpperCase();
    // Save key even if rest of profile isn't filled yet
    await setDoc(doc(db, "volunteers", currentUser.uid),
      { uniqueKey, uid: currentUser.uid, createdAt: new Date().toISOString() },
      { merge: true }
    );
  }
  document.getElementById("volUniqueKey").value = uniqueKey;

  if (!snap.exists()) return;
  const d = snap.data();
  document.getElementById("volName").value = d.name || "";
  document.getElementById("volSkills").value = (d.skills || []).join(", ");
  document.getElementById("volLocation").value = d.location || "";
  document.getElementById("volLat").value = d.latitude || "";
  document.getElementById("volLng").value = d.longitude || "";
  document.getElementById("volAvailability").value = d.availability || "available";
}

// Copy volunteer key to clipboard
document.getElementById("copyVolKeyBtn")?.addEventListener("click", () => {
  const key = document.getElementById("volUniqueKey").value;
  navigator.clipboard.writeText(key).then(() => alert("Key copied!")).catch(() => {
    prompt("Copy your key:", key);
  });
});

// ─── NGO: Volunteer Search + Key Exchange ────────────────────────────────────
let selectedVolForMatch = null;

function initNgoDashboard() {
  const keyEl = document.getElementById("ngoKeyDisplay");
  if (keyEl) keyEl.value = getOrCreateNgoKey();
}

function getOrCreateNgoKey() {
  if (!currentUser) return "";
  const storageKey = `ngoKey_${currentUser.uid}`;
  let key = localStorage.getItem(storageKey);
  if (!key) {
    key = Math.random().toString(36).substr(2, 8).toUpperCase();
    localStorage.setItem(storageKey, key);
  }
  return key;
}

async function searchVolunteers() {
  const skillInput = (document.getElementById("volSkillSearch")?.value || "").trim().toLowerCase();
  const list = document.getElementById("volunteerSearchList");
  if (!list) return;
  list.innerHTML = "<li class='empty-state'>Searching...</li>";

  const snap = await getDocs(collection(db, "volunteers"));
  const results = [];
  snap.forEach(d => {
    const v = d.data();
    const skills = (v.skills || []).map(s => s.toLowerCase());
    if (!skillInput || skills.some(s => s.includes(skillInput))) {
      results.push({ id: d.id, ...v });
    }
  });

  if (results.length === 0) {
    list.innerHTML = "<li class='empty-state'>No volunteers found for that skill.</li>";
    return;
  }

  list.innerHTML = "";
  results.forEach(v => {
    let volStatus = v.availability || "N/A";
    if (v.lastLogin) {
      const days = (new Date() - new Date(v.lastLogin)) / (1000 * 60 * 60 * 24);
      if (days > 30) {
        volStatus = "Inactive (>30 days)";
      }
    }
    const statusColor = volStatus.toLowerCase().includes('inactive') || volStatus.toLowerCase().includes('busy') ? 'var(--danger)' : 'var(--secondary)';

    const li = document.createElement("li");
    li.className = "match-item";
    li.innerHTML = `
      <div class="match-info">
        <div class="tooltip"><strong>${v.name || "N/A"}</strong><span class="tooltiptext">Email: ${v.email || 'N/A'}</span></div><br>
        <small>${(v.skills || []).join(", ")}</small>
      </div>
      <div class="match-info">
        <small>📍 ${v.location || "N/A"}</small><br>
        <small>Status: <span style="color: ${statusColor}; font-weight: bold;">${volStatus}</span></small>
      </div>
      <div class="match-score">
        <button class="btn primary-btn" style="width:auto; padding:0.4rem 0.8rem;" data-vid="${v.id}">Select</button>
      </div>
    `;
    li.querySelector("button").addEventListener("click", () => selectVolunteerForMatch(v));
    list.appendChild(li);
  });
}

function selectVolunteerForMatch(v) {
  selectedVolForMatch = v;
  document.getElementById("selectedVolDisplay").innerHTML =
    `<strong>${v.name}</strong> — Skills: ${(v.skills || []).join(", ")} | 📍 ${v.location || "N/A"}`;
  document.getElementById("ngoKeyDisplay").value = getOrCreateNgoKey();
  document.getElementById("enteredVolKey").value = "";
  document.getElementById("keyExchangeBox").classList.remove("hidden");
  document.getElementById("keyExchangeBox").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("volSearchBtn")?.addEventListener("click", searchVolunteers);
document.getElementById("volSkillSearch")?.addEventListener("keydown", e => { if (e.key === "Enter") searchVolunteers(); });

document.getElementById("clearMatchSelBtn")?.addEventListener("click", () => {
  selectedVolForMatch = null;
  document.getElementById("keyExchangeBox").classList.add("hidden");
  document.getElementById("enteredVolKey").value = "";
});

document.getElementById("confirmMatchBtn")?.addEventListener("click", async () => {
  if (!selectedVolForMatch) return;

  const enteredKey = document.getElementById("enteredVolKey").value.trim().toUpperCase();
  const ngoKey = getOrCreateNgoKey();
  const needType = document.getElementById("needType").value.trim();
  const ngoLocation = document.getElementById("requestLocation").value.trim();

  if (!enteredKey) { alert("Please enter the volunteer's unique key."); return; }
  if (enteredKey !== (selectedVolForMatch.uniqueKey || "").toUpperCase()) {
    alert("❌ Incorrect volunteer key. Please ask the volunteer to share their exact key.");
    return;
  }
  if (!needType || !ngoLocation) {
    alert("Please fill in the Need Type and Location in the request form above before confirming a match.");
    return;
  }

  try {
    await addDoc(collection(db, "confirmedMatches"), {
      volunteerId: selectedVolForMatch.id,
      volunteerName: selectedVolForMatch.name || "N/A",
      volunteerLocation: selectedVolForMatch.location || "N/A",
      volunteerEmail: selectedVolForMatch.email || "N/A",
      volunteerAvailability: selectedVolForMatch.availability || "N/A",
      volunteerLastLogin: selectedVolForMatch.lastLogin || null,
      volunteerKey: selectedVolForMatch.uniqueKey,
      ngoUid: currentUser.uid,
      ngoEmail: currentUser.email || "N/A",
      ngoKey,
      needType,
      requestLocation: ngoLocation,
      score: "Manual",
      confirmedAt: new Date().toISOString()
    });
    alert("✅ Match confirmed and saved!");
    selectedVolForMatch = null;
    document.getElementById("keyExchangeBox").classList.add("hidden");
    document.getElementById("enteredVolKey").value = "";
    loadNgoMatches();
  } catch (err) {
    alert("Error saving match: " + err.message);
  }
});

// ─── NGO Matches ─────────────────────────────────────────────────────────────
async function loadNgoMatches() {
  if (!currentUser) return;
  const [autoSnap, confirmedSnap] = await Promise.all([
    getDocs(query(collection(db, "matches"), orderBy("score", "desc"))),
    getDocs(query(collection(db, "confirmedMatches"), orderBy("confirmedAt", "desc")))
  ]);
  const autoMatches = autoSnap.docs.map(d => ({ ...d.data(), type: "Auto" }));
  const confirmedMatches = confirmedSnap.docs
    .map(d => ({ ...d.data(), score: 100, type: "Manual", manualLabel: "Manual ✅" })) // Manual matches high score
    .filter(m => m.ngoUid === currentUser.uid);
  ngoAllMatches = [...confirmedMatches, ...autoMatches];
  applyNgoFilters();
}

function applyNgoFilters() {
  const search = (document.getElementById("ngoMatchSearch")?.value || "").toLowerCase();
  const sort = document.getElementById("ngoMatchSort")?.value || "score_desc";

  let filtered = ngoAllMatches.filter(m => {
    const text = [m.volunteerName, m.volunteerLocation, m.needType, m.requestLocation].join(" ").toLowerCase();
    return !search || text.includes(search);
  });

  filtered.sort((a, b) => {
    if (sort === "date_desc") return new Date(b.confirmedAt || b.createdAt || 0) - new Date(a.confirmedAt || a.createdAt || 0);
    return (b.score || 0) - (a.score || 0);
  });

  renderMatchList("ngoMatchesList", "ngoShowMoreBtn", filtered, ngoShowAll);
}

document.getElementById("ngoMatchSearch")?.addEventListener("input", applyNgoFilters);
document.getElementById("ngoMatchSort")?.addEventListener("change", applyNgoFilters);

document.getElementById("ngoShowMoreBtn").addEventListener("click", () => {
  ngoShowAll = !ngoShowAll;
  applyNgoFilters();
});

// ─── Volunteer Matches ────────────────────────────────────────────────────────
async function loadVolMatches() {
  if (!currentUser) return;
  const [autoSnap, confirmedSnap] = await Promise.all([
    getDocs(query(collection(db, "matches"), orderBy("score", "desc"))),
    getDocs(query(collection(db, "confirmedMatches"), orderBy("confirmedAt", "desc")))
  ]);
  const autoMatches = autoSnap.docs.map(d => ({ ...d.data(), type: "Auto" })).filter(m => m.volunteerId === currentUser.uid);
  const confirmedMatches = confirmedSnap.docs
    .map(d => ({ ...d.data(), score: 100, type: "Manual", manualLabel: "Manual ✅" }))
    .filter(m => m.volunteerId === currentUser.uid);
  volAllMatches = [...confirmedMatches, ...autoMatches];
  applyVolFilters();
}

function applyVolFilters() {
  const search = (document.getElementById("volMatchSearch")?.value || "").toLowerCase();
  const sort = document.getElementById("volMatchSort")?.value || "score_desc";

  let filtered = volAllMatches.filter(m => {
    const text = [m.volunteerName, m.volunteerLocation, m.needType, m.requestLocation].join(" ").toLowerCase();
    return !search || text.includes(search);
  });

  filtered.sort((a, b) => {
    if (sort === "date_desc") return new Date(b.confirmedAt || b.createdAt || 0) - new Date(a.confirmedAt || a.createdAt || 0);
    return (b.score || 0) - (a.score || 0);
  });

  renderMatchList("volMatchesList", "volShowMoreBtn", filtered, volShowAll);
}

document.getElementById("volMatchSearch")?.addEventListener("input", applyVolFilters);
document.getElementById("volMatchSort")?.addEventListener("change", applyVolFilters);

document.getElementById("volShowMoreBtn").addEventListener("click", () => {
  volShowAll = !volShowAll;
  applyVolFilters();
});

// ─── Admin Matches ────────────────────────────────────────────────────────────
async function loadAdminMatches() {
  const [autoSnap, confirmedSnap] = await Promise.all([
    getDocs(query(collection(db, "matches"), orderBy("score", "desc"))),
    getDocs(query(collection(db, "confirmedMatches"), orderBy("confirmedAt", "desc")))
  ]);
  const autoMatches = autoSnap.docs.map(d => ({ ...d.data(), type: "Auto" }));
  const confirmedMatches = confirmedSnap.docs
    .map(d => ({ ...d.data(), score: 100, type: "Manual", manualLabel: "Manual ✅" }));
  allAdminMatches = [...confirmedMatches, ...autoMatches];

  // Generate Dummy Analytics
  renderCharts();
  initDynamicAdminStats();
  renderHeatmapData();
  populateAdminManualSelects();
}

async function populateAdminManualSelects() {
    const [reqSnap, volSnap] = await Promise.all([
        getDocs(collection(db, "requests")),
        getDocs(collection(db, "volunteers"))
    ]);
    const ngoSelect = document.getElementById("adminManualNgo");
    const volSelect = document.getElementById("adminManualVol");
    if (!ngoSelect || !volSelect) return;
    
    ngoSelect.innerHTML = '<option value="">Select NGO Request...</option>';
    volSelect.innerHTML = '<option value="">Select Volunteer...</option>';
    
    reqSnap.forEach(d => {
        const r = d.data();
        ngoSelect.innerHTML += `<option value="${d.id}">${r.ngoName || 'NGO'} - ${r.needType} (${r.location})</option>`;
    });
    volSnap.forEach(d => {
        const v = d.data();
        volSelect.innerHTML += `<option value="${d.id}">${v.name || 'Volunteer'} (${v.location}) - ${v.skills.join(',')}</option>`;
    });
}

document.getElementById("adminManualMatchBtn")?.addEventListener("click", async () => {
    const rid = document.getElementById("adminManualNgo").value;
    const vid = document.getElementById("adminManualVol").value;
    if (!rid || !vid) { alert("Please select both an NGO and a Volunteer."); return; }
    
    try {
        const [reqDoc, volDoc] = await Promise.all([
            getDoc(doc(db, "requests", rid)),
            getDoc(doc(db, "volunteers", vid))
        ]);
        const r = reqDoc.data();
        const v = volDoc.data();
        
        await addDoc(collection(db, "confirmedMatches"), {
            requestId: rid,
            volunteerId: vid,
            volunteerName: v.name || "N/A",
            volunteerLocation: v.location || "N/A",
            volunteerEmail: v.email || "N/A",
            volunteerAvailability: v.availability || "N/A",
            volunteerKey: v.uniqueKey || "N/A",
            ngoUid: r.submittedBy || "",
            ngoEmail: r.email || "N/A",
            needType: r.needType || "N/A",
            requestLocation: r.location || "N/A",
            score: "Manual",
            confirmedAt: new Date().toISOString()
        });
        alert("✅ Manual match created!");
        loadAdminMatches();
    } catch(e) { alert("Match failed: " + e.message); }
});

async function renderHeatmapData() {
    if (!adminMap) initAdminHeatmap();
    
    try {
        const snap = await getDocs(collection(db, "requests"));
        const heatPoints = [];
        snap.forEach(d => {
            const data = d.data();
            if (data.latitude && data.longitude) {
                // Weight by people affected and urgency
                let intensity = (data.peopleAffected || 1) / 100;
                if (data.urgency === 'High') intensity *= 2;
                heatPoints.push([data.latitude, data.longitude, intensity]);
            }
        });
        
        if (heatLayer) adminMap.removeLayer(heatLayer);
        heatLayer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
        }).addTo(adminMap);
        
        // Fit bounds if points exist
        if (heatPoints.length > 0) {
            const bounds = L.latLngBounds(heatPoints.map(p => [p[0], p[1]]));
            adminMap.fitBounds(bounds, { padding: [20, 20] });
        }
    } catch(e) { console.error("Heatmap error:", e); }
}

function initAdminHeatmap() {
    if (adminMap) return;
    adminMap = L.map('adminHeatmap').setView([20.5937, 78.9629], 5); // India center default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(adminMap);
    
    // Fix leaflet resize issue in hidden tabs
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                adminMap.invalidateSize();
            }
        });
    }, { threshold: 0.1 });
    observer.observe(document.getElementById('adminHeatmap'));
}

function initDynamicAdminStats() {
    getDoc(doc(db, "siteContent", "stats")).then(snap => {
        if(snap.exists()) {
            document.getElementById("editStatVolunteers").value = snap.data().volunteers || "";
            document.getElementById("editStatImpacted").value = snap.data().impacted || "";
            document.getElementById("editStatNGOs").value = snap.data().ngos || "";
        }
    });
    getDoc(doc(db, "siteContent", "motive")).then(snap => {
        if(snap.exists()) document.getElementById("editMotiveText").value = snap.data().text || "";
    });
    getDoc(doc(db, "siteContent", "instructions")).then(snap => {
        if(snap.exists()) document.getElementById("editInstructionsText").value = snap.data().text || "";
    });
    getDoc(doc(db, "siteContent", "contact")).then(snap => {
        if(snap.exists()) document.getElementById("editContactText").value = snap.data().text || "";
    });
}

document.getElementById("saveStatsBtn")?.addEventListener("click", async () => {
    const v = document.getElementById("editStatVolunteers").value;
    const i = document.getElementById("editStatImpacted").value;
    const n = document.getElementById("editStatNGOs").value;
    await setDoc(doc(db, "siteContent", "stats"), { volunteers: v, impacted: i, ngos: n });
    alert("Stats updated!");
});
document.getElementById("saveMotiveBtn")?.addEventListener("click", async () => {
    const t = document.getElementById("editMotiveText").value;
    await setDoc(doc(db, "siteContent", "motive"), { text: t });
    alert("Motive updated!");
});
document.getElementById("saveInstructionsBtn")?.addEventListener("click", async () => {
    const t = document.getElementById("editInstructionsText").value;
    await setDoc(doc(db, "siteContent", "instructions"), { text: t });
    alert("Instructions updated!");
});
document.getElementById("saveContactBtn")?.addEventListener("click", async () => {
    const t = document.getElementById("editContactText").value;
    await setDoc(doc(db, "siteContent", "contact"), { text: t });
    alert("Contacts updated!");
});

// Run Background auto matcher
async function triggerAutoMatcher() {
    try {
      const sysDoc = await getDoc(doc(db, "settings", "system"));
      const lastRun = sysDoc.exists() ? sysDoc.data().lastMatchTime : 0;
      const now = Date.now();
      if (now - lastRun > 60 * 60 * 1000) { // 1 hour
          console.log("1 hour passed, running auto matcher in background...");
          await setDoc(doc(db, "settings", "system"), { lastMatchTime: now }, { merge: true });
          await runMatchingAlgorithm(true); // silent
      }
    } catch(e) { console.error("Auto matcher background error", e); }
}
triggerAutoMatcher();

// Global Delete Match for Admin
window.deleteMatch = async (id, type) => {
    if (!confirm("Remove this match?")) return;
    try {
        const collectionName = type === 'Manual' ? 'confirmedMatches' : 'matches';
        const { deleteDoc, doc: fsDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
        await deleteDoc(fsDoc(db, collectionName, id));
        alert("Match removed.");
        if (currentRole === 'Admin') loadAdminMatches();
        if (currentRole === 'NGO') loadNgoMatches();
    } catch(e) { alert("Error removing: " + e.message); }
}

async function runMatchingAlgorithm(silent = false) {
    if (!silent) {
       document.getElementById("runMatchingBtn").disabled = true;
       document.getElementById("runMatchingBtn").textContent = "Matching...";
    }
    try {
      const requestsSnap = await getDocs(query(collection(db, "requests"), where("status", "==", "new")));
      const volunteersSnap = await getDocs(collection(db, "volunteers"));

      if (requestsSnap.empty || volunteersSnap.empty) {
        if (!silent) alert("No new requests or available volunteers.");
        return;
      }

      let matchCount = 0;

      for (const reqDoc of requestsSnap.docs) {
        const req = reqDoc.data();
        let best = null;
        let bestScore = 0;

        for (const volDoc of volunteersSnap.docs) {
          const vol = volDoc.data();
          let score = 0;
          
          const skills = (vol.skills || []).map(s => s.toLowerCase());
          const need = (req.needType || "").toLowerCase();
          
          let skillMatched = false;
          if (skills.includes(need)) skillMatched = true;
          else if (skills.some(s => need.includes(s) || s.includes(need))) skillMatched = true;

          // Huge boost if a single skill matches!
          if (skillMatched) score += 500;

          if ((vol.location || "").toLowerCase() === (req.location || "").toLowerCase()) score += 3;
          if (vol.availability === "available") score += 2;
          if (req.urgency === "High") score += 1;

          if (score > bestScore && score >= 500) { // Require skill match
            bestScore = score;
            best = { id: volDoc.id, ...vol };
          }
        }

        if (best && bestScore > 0) {
          // Prevent duplicates
          const dupQ = query(collection(db, "matches"), 
            where("requestId", "==", reqDoc.id),
            where("volunteerId", "==", best.id)
          );
          const dup = await getDocs(dupQ);
          if (dup.empty) {
            await addDoc(collection(db, "matches"), {
              requestId: reqDoc.id,
              volunteerId: best.id,
              volunteerName: best.name || "N/A",
              volunteerLocation: best.location || "N/A",
              volunteerEmail: best.email || "N/A",
              volunteerAvailability: best.availability || "N/A",
              volunteerLastLogin: best.lastLogin || null,
              needType: req.needType || "N/A",
              requestLocation: req.location || "N/A",
              ngoEmail: req.email || "N/A",
              score: bestScore,
              status: "pending",
              createdAt: new Date().toISOString()
            });
            matchCount++;
          }
        }
      }

      if (!silent) {
         alert(`Matching Complete! Created ${matchCount} new matches.`);
         loadAdminMatches();
      }
    } catch (err) {
      if (!silent) alert("Error running AI Matcher: " + err.message);
    } finally {
      if (!silent) {
         document.getElementById("runMatchingBtn").disabled = false;
         document.getElementById("runMatchingBtn").textContent = "Run AI Matcher Now";
      }
    }
}

document.getElementById("runMatchingBtn")?.addEventListener("click", () => runMatchingAlgorithm(false));

function applyAdminFilters() {
  const search = (document.getElementById("adminMatchSearch")?.value || "").toLowerCase();
  const sort = document.getElementById("adminMatchSort")?.value || "score_desc";

  let filtered = allAdminMatches.filter(m => {
    const text = [m.volunteerName, m.volunteerLocation, m.needType, m.requestLocation].join(" ").toLowerCase();
    return !search || text.includes(search);
  });

  filtered.sort((a, b) => {
    if (sort === "score_asc") return (a.score ?? 0) - (b.score ?? 0);
    if (sort === "date_desc") return new Date(b.confirmedAt || b.createdAt || 0) - new Date(a.confirmedAt || a.createdAt || 0);
    return (b.score ?? 0) - (a.score ?? 0); // score_desc default
  });

  adminShowAll = false;
  renderMatchList("adminMatchesList", "adminShowMoreBtn", filtered, adminShowAll);

  document.getElementById("adminShowMoreBtn").onclick = () => {
    adminShowAll = !adminShowAll;
    renderMatchList("adminMatchesList", "adminShowMoreBtn", filtered, adminShowAll);
  };
}

document.getElementById("adminMatchSearch")?.addEventListener("input", applyAdminFilters);
document.getElementById("adminMatchSort")?.addEventListener("change", applyAdminFilters);
document.getElementById("refreshAdminBtn")?.addEventListener("click", loadAdminMatches);

// ─── Admin Charts ─────────────────────────────────────────────────────────────
let needsChartInst = null, urgencyChartInst = null, timeChartInst = null, skillsChartInst = null;

async function renderCharts() {
  const snap = await getDocs(collection(db, "requests"));
  const needsData = { Food: 0, Shelter: 0, Medical: 0, Other: 0 };
  const urgencyData = { High: 0, Medium: 0, Low: 0 };

  snap.forEach(d => {
    const r = d.data();
    const n = r.needType || "Other";
    needsData[n] = (needsData[n] || 0) + 1;
    const u = r.urgency || "Low";
    if (urgencyData[u] !== undefined) urgencyData[u]++;
  });

  const ctxN = document.getElementById("needsChart");
  const ctxU = document.getElementById("urgencyChart");
  const ctxT = document.getElementById("matchesTimeChart");
  const ctxS = document.getElementById("skillsChart");

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "var(--text-main)" } }
    }
  };

  if (ctxN) {
    if (needsChartInst) needsChartInst.destroy();
    needsChartInst = new Chart(ctxN, {
      type: "doughnut",
      data: {
        labels: Object.keys(needsData),
        datasets: [{ data: Object.values(needsData), backgroundColor: ["#f87171", "#fbbf24", "#34d399", "#60a5fa"], borderWidth: 0 }]
      },
      options: commonOptions
    });
  }

  if (ctxU) {
    if (urgencyChartInst) urgencyChartInst.destroy();
    urgencyChartInst = new Chart(ctxU, {
      type: "bar",
      data: {
        labels: Object.keys(urgencyData),
        datasets: [{ label: "Requests", data: Object.values(urgencyData), backgroundColor: ["#34d399", "#fbbf24", "#f87171"] }]
      },
      options: { ...commonOptions, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: "var(--text-main)" } }, x: { ticks: { color: "var(--text-main)" } } } }
    });
  }

  if (ctxT) {
    if (timeChartInst) timeChartInst.destroy();
    timeChartInst = new Chart(ctxT, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{ label: "Matches", data: [5, 12, 18, 30, 42, 60], borderColor: "#60A5FA", backgroundColor: "rgba(96, 165, 250, 0.2)", fill: true, tension: 0.4 }]
      },
      options: { ...commonOptions, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: "var(--text-main)" } }, x: { ticks: { color: "var(--text-main)" } } } }
    });
  }

  if (ctxS) {
    if (skillsChartInst) skillsChartInst.destroy();
    skillsChartInst = new Chart(ctxS, {
      type: "pie",
      data: {
        labels: ["Medical", "Cooking", "Driving", "Logistics", "Rescue"],
        datasets: [{ data: [35, 25, 20, 10, 10], backgroundColor: ["#F472B6", "#FBBF24", "#34D399", "#A78BFA", "#F87171"], borderWidth: 0 }]
      },
      options: commonOptions
    });
  }
}

// ─── OCR Flow ──────────────────────────────────────────────────────────────
let selectedImageFile = null;
const surveyImageEl = document.getElementById("surveyImage");
const ocrPreviewEl = document.getElementById("ocrPreview");
const ocrStatusEl = document.getElementById("ocrStatus");
const ocrStatusTextEl = document.getElementById("ocrStatusText");
const processOcrBtnEl = document.getElementById("processOcrBtn");

function parseOcrText(text) {
  const t = text.toLowerCase();
  let needType = "Other";
  if (t.includes("food") || t.includes("hungry") || t.includes("ration")) needType = "Food";
  else if (t.includes("shelter") || t.includes("homeless") || t.includes("camp")) needType = "Shelter";
  else if (t.includes("medical") || t.includes("injured") || t.includes("doctor")) needType = "Medical";

  let urgency = "Low";
  if (t.includes("critical") || t.includes("trapped") || t.includes("urgent") || t.includes("high")) urgency = "High";
  else if (t.includes("medium")) urgency = "Medium";

  let location = "";
  const locMatch = text.match(/location[:\-]?\s*([a-zA-Z\s]+)/i);
  if (locMatch?.[1]) location = locMatch[1].trim().split("\n")[0];

  let peopleAffected = 0;
  const pm = text.match(/people[:\-]?\s*(\d+)/i) || text.match(/(\d+)\s*people/i);
  if (pm?.[1]) peopleAffected = parseInt(pm[1], 10);

  return { needType, urgency, location, peopleAffected, description: text.slice(0, 200) };
}

if (surveyImageEl) {
  surveyImageEl.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = ev => {
      ocrPreviewEl.innerHTML = `<img src="${ev.target.result}" style="max-width:100%;border-radius:8px;" alt="Preview">`;
    };
    reader.readAsDataURL(file);
    processOcrBtnEl.disabled = false;
  });
}

if (processOcrBtnEl) {
  processOcrBtnEl.addEventListener("click", async () => {
    if (!selectedImageFile) return;
    processOcrBtnEl.disabled = true;
    ocrStatusEl.classList.remove("hidden");
    ocrStatusTextEl.textContent = "Initializing Tesseract...";

    try {
      const result = await Tesseract.recognize(selectedImageFile, "eng", {
        logger: m => {
          if (m.status === "recognizing text")
            ocrStatusTextEl.textContent = `Recognizing... ${Math.round(m.progress * 100)}%`;
          else ocrStatusTextEl.textContent = m.status;
        }
      });
      const parsed = parseOcrText(result.data.text);

      // Prefill the form
      document.getElementById("needType").value = parsed.needType;
      document.getElementById("requestDescription").value = parsed.description;
      document.getElementById("requestLocation").value = parsed.location;
      document.getElementById("urgency").value = parsed.urgency;
      document.getElementById("peopleAffected").value = parsed.peopleAffected;

      alert("✅ Form pre-filled from scanned survey. Please review before submitting.");
      selectedImageFile = null;
      surveyImageEl.value = "";
      ocrPreviewEl.innerHTML = "";
    } catch (err) {
      alert("OCR failed: " + err.message);
    } finally {
      processOcrBtnEl.disabled = false;
      ocrStatusEl.classList.add("hidden");
    }
  });
}