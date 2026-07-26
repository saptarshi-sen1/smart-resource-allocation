import { db } from "./firebase.js";
import {
	collection,
	addDoc,
	getDocs,
	query,
	where,
	orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Map and geolocation
let map, marker;
function initMap() {
	map = L.map('map').setView([20.5937, 78.9629], 4);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors'
	}).addTo(map);
	map.on('click', function(e) {
		setLatLng(e.latlng.lat, e.latlng.lng);
	});
}
function setLatLng(lat, lng) {
	document.getElementById('requestLatitude').value = lat;
	document.getElementById('requestLongitude').value = lng;
	if (marker) { marker.setLatLng([lat, lng]); }
	else { marker = L.marker([lat, lng]).addTo(map); }
}
document.getElementById('getLocationBtn').onclick = function() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(pos => {
			setLatLng(pos.coords.latitude, pos.coords.longitude);
			map.setView([pos.coords.latitude, pos.coords.longitude], 13);
		});
	} else {
		alert('Geolocation not supported');
	}
};
initMap();

// --- NGO Key Generation & Display ---
function getOrCreateNgoKey() {
  let key = localStorage.getItem('ngoKey');
  if (!key) {
    key = Math.random().toString(36).substr(2, 8).toUpperCase();
    localStorage.setItem('ngoKey', key);
  }
  return key;
}
function showNgoKey() {
  const ngoKeyInput = document.getElementById('ngoKeyDisplay');
  if (ngoKeyInput) ngoKeyInput.value = getOrCreateNgoKey();
}
showNgoKey();

// --- Tesseract OCR Flow ---
const surveyImage = document.getElementById('surveyImage');
const ocrPreview = document.getElementById('ocrPreview');
const ocrStatus = document.getElementById('ocrStatus');
const ocrStatusText = document.getElementById('ocrStatusText');
const processOcrBtn = document.getElementById('processOcrBtn');

let selectedImageFile = null;

if (surveyImage) {
  surveyImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        ocrPreview.innerHTML = `<img src="${event.target.result}" style="max-width:100%; border:1px solid #ccc; margin-top:10px;" alt="Survey Preview">`;
      };
      reader.readAsDataURL(file);
      processOcrBtn.disabled = false;
    }
  });
}

function parseOcrText(text) {
  const textLower = text.toLowerCase();
  
  let needType = "Other";
  if (textLower.includes("food") || textLower.includes("hungry") || textLower.includes("ration")) needType = "Food";
  else if (textLower.includes("shelter") || textLower.includes("homeless") || textLower.includes("camp")) needType = "Shelter";
  else if (textLower.includes("medical") || textLower.includes("injured") || textLower.includes("bleeding") || textLower.includes("doctor")) needType = "Medical";
  
  let urgency = "Low";
  if (textLower.includes("critical") || textLower.includes("trapped") || textLower.includes("high") || textLower.includes("urgent")) urgency = "High";
  else if (textLower.includes("medium")) urgency = "Medium";
  
  let location = "Unknown";
  const locMatch = text.match(/location[:\-]?\s*([a-zA-Z\s]+)/i);
  if (locMatch && locMatch[1]) {
    location = locMatch[1].trim().split('\n')[0];
  }

  let peopleAffected = 0;
  const peopleMatch = text.match(/people[:\-]?\s*(\d+)/i) || text.match(/(\d+)\s*people/i);
  if (peopleMatch && peopleMatch[1]) {
    peopleAffected = parseInt(peopleMatch[1], 10);
  }

  return { needType, location, urgency, peopleAffected };
}

if (processOcrBtn) {
  processOcrBtn.addEventListener('click', async () => {
    if (!selectedImageFile) return;
    
    processOcrBtn.disabled = true;
    ocrStatus.style.display = 'block';
    ocrStatusText.innerText = "Initializing Tesseract...";
    
    try {
      const result = await Tesseract.recognize(selectedImageFile, 'eng', {
        logger: m => {
          if (m.status === "recognizing text") {
            ocrStatusText.innerText = `Recognizing text... ${Math.round(m.progress * 100)}%`;
          } else {
            ocrStatusText.innerText = m.status;
          }
        }
      });
      
      const text = result.data.text;
      ocrStatusText.innerText = "Parsing extracted text...";
      
      const parsedData = parseOcrText(text);
      
      // Prefill the form instead of autosubmitting
      document.getElementById("needType").value = parsedData.needType;
      document.getElementById("requestLocation").value = parsedData.location;
      document.getElementById("urgency").value = parsedData.urgency;
      document.getElementById("peopleAffected").value = parsedData.peopleAffected;

      alert(`Extracted Data:\nNeeds: ${parsedData.needType}\nLocation: ${parsedData.location}\nUrgency: ${parsedData.urgency}\nPeople: ${parsedData.peopleAffected}\n\nForm has been pre-filled! Please review before submitting.`);
      
      // Reset OCR UI
      surveyImage.value = "";
      selectedImageFile = null;
      ocrPreview.innerHTML = "";
      
    } catch (err) {
      console.error(err);
      alert("Failed to process image.");
    } finally {
      processOcrBtn.disabled = false;
      ocrStatus.style.display = 'none';
    }
  });
}

// NGO request form
const requestForm = document.getElementById('requestForm');
requestForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const ngoName = document.getElementById('ngoName').value;
	const ngoEmail = document.getElementById('ngoEmail').value;
	const needType = document.getElementById('needType').value;
	const location = document.getElementById('requestLocation').value;
	const latitude = parseFloat(document.getElementById('requestLatitude').value);
	const longitude = parseFloat(document.getElementById('requestLongitude').value);
	const verified = document.getElementById('requestVerified').checked;
	const urgency = document.getElementById('urgency').value;
	const peopleAffected = parseInt(document.getElementById('peopleAffected').value);
	const autoVerify = document.getElementById('autoVerify').checked;

	// AI summary and genuineness (placeholder logic)
	const aiSummary = `Summary: ${needType} needed at ${location} for ${peopleAffected} people. Urgency: ${urgency}.`;
	const aiGenuineness = Math.random() > 0.2 ? 'Likely Genuine' : 'Needs Review';
	const aiVerified = autoVerify ? (aiGenuineness === 'Likely Genuine') : verified;

	try {
		await addDoc(collection(db, 'requests'), {
			ngoName, ngoEmail, needType, location, latitude, longitude, verified: aiVerified, urgency, peopleAffected, createdAt: new Date().toISOString(),
			aiSummary, aiGenuineness, aiVerified
		});
		requestForm.reset();
		if (marker) { map.removeLayer(marker); marker = null; }
		// Restore NGO key after reset
		showNgoKey();
		// Show matches immediately after request
		await showMatches();
		// Also find smart top 3 matches based on the new request
		// Re-populate the form briefly to trigger smart match, then clear it or just call it directly with the values.
		// Since we just reset the form, let's temporarily set the values to find matches
		document.getElementById('needType').value = needType;
		document.getElementById('requestLatitude').value = latitude;
		document.getElementById('requestLongitude').value = longitude;
		await findTopMatches();
		requestForm.reset(); // reset again after fetching
		showNgoKey();
		
		const matchesList = document.getElementById('volunteerMatchingBox');
		matchesList.scrollIntoView({ behavior: 'smooth' });
	} catch (err) {
		alert('Error submitting request');
	}
});

// Show matches for this NGO (by needType, for demo)
async function showMatches() {
       const needType = document.getElementById('needType').value;
       const matchesList = document.getElementById('matchesList');
       if (!needType) {
	       matchesList.innerHTML = '<li>Enter a need type to see matches.</li>';
	       return;
       }
       matchesList.innerHTML = 'Loading...';
       const q = query(collection(db, 'matches'), where('needType', '==', needType));
       const snap = await getDocs(q);
       if (snap.empty) { matchesList.innerHTML = '<li>No matches found.</li>'; return; }
       let html = '';
       snap.forEach(doc => {
	       const m = doc.data();
	       html += `<li>
            <div class="tooltip">Volunteer: <b>${m.volunteerName}</b><span class="tooltiptext">Email: ${m.volunteerEmail || 'N/A'}</span></div> | 
            Location: ${m.volunteerLocation} | 
            <a href="mailto:${m.volunteerEmail || ''}" target="_blank"><button type="button" style="margin-top:0; padding:4px 8px; font-size:0.85rem; background:var(--secondary);">Email</button></a>
            <button type="button" style="margin-top:0; padding:4px 8px; font-size:0.85rem;" onclick="confirmContact('${doc.id}')">Confirm</button>
        </li>`;
       });
       matchesList.innerHTML = html;
}


// --- Volunteer Matching Section ---
let selectedVolunteerDocId = null;
let selectedVolunteerData = null;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

async function findTopMatches() {
	const needType = document.getElementById('needType').value.trim().toLowerCase();
	const reqLat = parseFloat(document.getElementById('requestLatitude').value);
	const reqLon = parseFloat(document.getElementById('requestLongitude').value);

	if (!needType || isNaN(reqLat) || isNaN(reqLon)) {
		alert('Please fill out Need Type and Location/Coordinates in the form first.');
		return;
	}

	const topMatchesList = document.getElementById('topMatchesList');
	topMatchesList.innerHTML = '<li>Analyzing location and skills...</li>';

	const snap = await getDocs(query(collection(db, 'volunteers'), where('availability', '==', 'available')));
	let volunteers = [];
	
	snap.forEach(doc => {
		let v = doc.data();
		v.id = doc.id;
		
		// Distance calculation
		if (v.latitude && v.longitude) {
			v.distance = getDistanceFromLatLonInKm(reqLat, reqLon, v.latitude, v.longitude);
		} else {
			v.distance = 99999;
		}

		// Skill score
		let skillScore = 0;
		const vSkills = (v.skills || []).map(s => s.toLowerCase());
		
		if (vSkills.some(s => s.includes(needType) || needType.includes(s))) {
			skillScore = 500; // high match
		} else if (
			(needType.includes('food') || needType.includes('shelter')) && vSkills.includes('basic relief') ||
			needType.includes('medical') && vSkills.includes('medical') ||
			needType.includes('trapped') && vSkills.includes('rescue')
		) {
			skillScore = 800; // direct category match
		}

		// Base score (higher is better). Closer distance reduces penalty.
		v.score = skillScore - (v.distance * 1); // 1 point deduction per km

		// Add bonus for verified
		if (v.verified) v.score += 50;

		volunteers.push(v);
	});

	// Sort descending by score
	volunteers.sort((a, b) => b.score - a.score);
	
	// Get Top 3
	const top3 = volunteers.slice(0, 3);
	
	let html = '';
	if (top3.length === 0) {
		html = '<li>No available volunteers found.</li>';
	} else {
		top3.forEach((v, index) => {
			const distStr = v.distance === 99999 ? 'Unknown Dist' : v.distance.toFixed(1) + ' km';
			const matchBadge = index === 0 ? '<span class="match-score" style="background:var(--warning)">#1 Best Match</span>' : `<span class="match-score">#${index+1} Match</span>`;
			html += `
			<li class="match-item">
				<div class="match-details">
					<div style="margin-bottom:5px;">${matchBadge} <div class="tooltip"><b>${v.name}</b><span class="tooltiptext">Email: ${v.email || 'N/A'}</span></div> ${v.verified ? '✅' : ''}</div>
					<div>Skills: ${(v.skills || []).join(', ')}</div>
					<div style="font-size:0.9em; color:var(--text-muted); margin-top:4px;">${v.location} (${distStr} away)</div>
				</div>
				<div class="match-actions">
					<button onclick="window.selectVolunteerForMatch('${v.id}')" style="margin-top:0; padding:8px 16px;">Select</button>
                    <a href="mailto:${v.email || ''}" target="_blank"><button style="margin-top:0; padding:8px 16px; background:var(--secondary);">Contact</button></a>
				</div>
			</li>`;
		});
	}
	topMatchesList.innerHTML = html;
}

window.selectVolunteerForMatch = async function(volunteerDocId) {
	// Fetch volunteer data
	const snap = await getDocs(query(collection(db, 'volunteers')));
	let volunteer = null;
	snap.forEach(doc => { if (doc.id === volunteerDocId) volunteer = doc.data(); });
	if (!volunteer) {
		alert('Volunteer not found.');
		return;
	}
	selectedVolunteerDocId = volunteerDocId;
	selectedVolunteerData = volunteer;
	updateSelectedVolunteerDisplay();
};

function updateSelectedVolunteerDisplay() {
	const display = document.getElementById('selectedVolunteerDisplay');
	const clearBtn = document.getElementById('clearVolunteerSelectionBtn');
	if (selectedVolunteerData) {
		display.innerHTML = `<b>Selected Volunteer:</b> ${selectedVolunteerData.name} (${selectedVolunteerData.location})`;
		clearBtn.style.display = '';
		// Show key exchange UI for both keys
		document.getElementById('keyExchangePlatform').innerHTML = `
			<div style="margin-top:10px;">
				<label>Enter Volunteer Key:</label>
				<input type="text" id="enteredVolunteerKey" style="width:120px;" />
				<label style="margin-left:10px;">Enter Your NGO Key:</label>
				<input type="text" id="enteredNgoKey" style="width:120px;" />
				<button id="confirmVolunteerMatchBtn">Confirm Match</button>
			</div>
		`;
		document.getElementById('confirmVolunteerMatchBtn').onclick = confirmVolunteerMatch;
	} else {
		display.innerHTML = '<i>No volunteer selected.</i>';
		clearBtn.style.display = 'none';
		document.getElementById('keyExchangePlatform').innerHTML = '';
	}
}

document.getElementById('findTopMatchesBtn').onclick = findTopMatches;
document.getElementById('clearVolunteerSelectionBtn').onclick = function() {
	selectedVolunteerDocId = null;
	selectedVolunteerData = null;
	updateSelectedVolunteerDisplay();
};

// Initial display
updateSelectedVolunteerDisplay();

async function confirmVolunteerMatch() {
  if (!selectedVolunteerData || !selectedVolunteerDocId) return;
  const ngoNeedType = document.getElementById('needType').value;
  const ngoLocation = document.getElementById('requestLocation').value;
  const ngoKeyLocal = getOrCreateNgoKey();
  if (!ngoNeedType || !ngoLocation || !ngoKeyLocal) {
    alert('Please fill the request form first.');
    return;
  }
  const enteredKey = document.getElementById('enteredVolunteerKey').value.trim();
  if (enteredKey !== selectedVolunteerData.uniqueKey) {
    alert('Invalid volunteer key. Please ask the volunteer for their correct key.');
    return;
  }
  const enteredNgoKey = document.getElementById('enteredNgoKey').value.trim();
  if (enteredNgoKey !== ngoKeyLocal) {
    alert('Invalid NGO key. Please use the key shown above.');
    return;
  }
  // Create a match in Firestore
  await addDoc(collection(db, 'matches'), {
    volunteerName: selectedVolunteerData.name,
    volunteerEmail: selectedVolunteerData.email || '',
    volunteerLocation: selectedVolunteerData.location,
    needType: ngoNeedType,
    ngoName: document.getElementById('ngoName').value || '',
    ngoEmail: document.getElementById('ngoEmail').value || '',
    requestLocation: ngoLocation,
    ngoKey: ngoKeyLocal,
    volunteerKey: selectedVolunteerData.uniqueKey,
    score: 'Auto',
    createdAt: new Date().toISOString()
  });
  // Update volunteer status to 'matched'
  const volunteerSnap = await getDocs(query(collection(db, 'volunteers')));
  volunteerSnap.forEach(async doc => {
    if (doc.id === selectedVolunteerDocId) {
      await doc.ref.update({ availability: 'matched' });
    }
  });
  // Update NGO status to 'matched' for this needType/location
  const ngoSnap = await getDocs(query(collection(db, 'requests'), where('needType', '==', ngoNeedType), where('location', '==', ngoLocation)));
  ngoSnap.forEach(async doc => {
    await doc.ref.update({ status: 'matched' });
  });
  alert('Match confirmed and saved!');
  selectedVolunteerDocId = null;
  selectedVolunteerData = null;
  updateSelectedVolunteerDisplay();
  await showMatches();
}
window.showMatches = showMatches;

// Confirm contact (for demo, just remove match)
async function confirmContact(matchId) {
	const matchSnap = await getDocs(query(collection(db, 'matches'), where('__name__', '==', matchId)));
	if (!matchSnap.empty) {
		await addDoc(collection(db, 'confirmedMatches'), { ...matchSnap.docs[0].data(), confirmedAt: new Date().toISOString() });
		await matchSnap.docs[0].ref.delete();
		alert('Contact confirmed!');
		await showMatches();
	}
}
window.confirmContact = confirmContact;

// Auto-show matches when needType is entered
document.getElementById('needType').addEventListener('blur', showMatches);
// Also show matches on input for better UX
document.getElementById('needType').addEventListener('input', showMatches);
