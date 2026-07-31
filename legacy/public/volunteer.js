// Allow volunteer to search and view available NGO requests
window.searchRequests = async function() {
       const searchNeed = prompt('Enter need type to search for NGO requests (leave blank for all):');
       let q;
       if (searchNeed) {
	       q = query(collection(db, 'requests'), where('needType', '==', searchNeed));
       } else {
	       q = query(collection(db, 'requests'));
       }
       const snap = await getDocs(q);
       let html = '';
       if (snap.empty) {
	       html = '<li>No NGO requests found.</li>';
       } else {
	       snap.forEach(doc => {
		       const r = doc.data();
		       html += `<li>
                   <div style="margin-bottom: 5px;">
                       <div class="tooltip"><b>${r.ngoName || 'NGO'}</b><span class="tooltiptext">Email: ${r.ngoEmail || 'N/A'}</span></div> | 
                       <b>${r.needType}</b> | Location: ${r.location} | Urgency: ${r.urgency}
                   </div>
                   <div>People: ${r.peopleAffected} | Verified: ${r.verified ? 'Yes' : 'No'}</div>
                   <div style="font-size:0.9em; color:var(--text-muted); margin-bottom: 8px;">AI Summary: ${r.aiSummary || ''} | Genuineness: ${r.aiGenuineness || ''}</div>
                   <div>
                       <a href="mailto:${r.ngoEmail || ''}" target="_blank"><button style="margin-top:0; padding:6px 12px; background:var(--secondary); font-size: 0.9em;">Contact NGO</button></a>
                   </div>
               </li>`;
	       });
       }
       let container = document.getElementById('ngoRequestSearchList');
       if (!container) {
	       container = document.createElement('ul');
	       container.id = 'ngoRequestSearchList';
	       document.body.appendChild(container);
       }
       container.innerHTML = html;
}
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
	map = L.map('map').setView([20.5937, 78.9629], 4); // Center on India
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors'
	}).addTo(map);
	map.on('click', function(e) {
		setLatLng(e.latlng.lat, e.latlng.lng);
	});
}
async function setLatLng(lat, lng) {
	document.getElementById('latitude').value = lat;
	document.getElementById('longitude').value = lng;
	if (marker) { marker.setLatLng([lat, lng]); }
	else { marker = L.marker([lat, lng]).addTo(map); }
	const locInput = document.getElementById('location');
	if (locInput && (!locInput.value || locInput.value === "Detecting location...")) {
		try {
			const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
			if (bdcRes.ok) {
				const data = await bdcRes.json();
				const parts = [data.locality || data.city, data.principalSubdivision, data.countryName].filter(Boolean);
				if (parts.length > 0) locInput.value = parts.join(', ');
			}
		} catch(e) {}
	}
}
document.getElementById('getLocationBtn').onclick = function() {
	if (navigator.geolocation) {
		const locInput = document.getElementById('location');
		if (locInput) locInput.value = "Detecting location...";
		navigator.geolocation.getCurrentPosition(pos => {
			setLatLng(pos.coords.latitude, pos.coords.longitude);
			map.setView([pos.coords.latitude, pos.coords.longitude], 13);
		}, async () => {
			try {
				const res = await fetch('https://ipapi.co/json/');
				if (res.ok) {
					const data = await res.json();
					if (data.latitude && data.longitude) {
						setLatLng(data.latitude, data.longitude);
						map.setView([data.latitude, data.longitude], 10);
					}
				}
			} catch(e) {}
		});
	} else {
		alert('Geolocation not supported');
	}
};
initMap();

// Volunteer registration
const volunteerForm = document.getElementById('volunteerForm');
volunteerForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const name = document.getElementById('name').value;
	const email = document.getElementById('email').value;
	const skills = [document.getElementById('skills').value]; // Wrap in array for compatibility
	const location = document.getElementById('location').value;
	const latitude = parseFloat(document.getElementById('latitude').value);
	const longitude = parseFloat(document.getElementById('longitude').value);
	const verified = document.getElementById('verified').checked;
	const availability = document.getElementById('availability').value;
		       try {
			       // Generate a unique key for the volunteer
			       const uniqueKey = Math.random().toString(36).substr(2, 8).toUpperCase();
			       document.getElementById('volunteerKeyDisplay').value = uniqueKey;
			       document.getElementById('keyExchangePlatform').innerHTML = `<b>Your Volunteer Key:</b> <span style="font-family:monospace;">${uniqueKey}</span> <br>Share this key with the NGO to confirm a match.`;
			       await addDoc(collection(db, 'volunteers'), {
				       name, email, skills, location, latitude, longitude, verified, availability, createdAt: new Date().toISOString(), uniqueKey
			       });
			       alert('Volunteer registered! Your unique key is: ' + uniqueKey + '\nShare this key with the NGO to confirm a match.');
			       // Do not reset the form so the key remains visible
			       if (marker) { map.removeLayer(marker); marker = null; }
			       // Show matches immediately after registration
			       await showMatches();
			       const matchesList = document.getElementById('matchesList');
			       matchesList.scrollIntoView({ behavior: 'smooth' });
		       } catch (err) {
			       alert('Error registering volunteer');
		       }
});

// Show matches for this volunteer (by name, for demo)
async function showMatches() {
	const name = document.getElementById('name').value;
	const matchesList = document.getElementById('matchesList');
	if (!name) {
		matchesList.innerHTML = '<li>Enter your name to see matches.</li>';
		return;
	}
	matchesList.innerHTML = 'Loading...';
	const q = query(collection(db, 'matches'), where('volunteerName', '==', name));
	const snap = await getDocs(q);
	if (snap.empty) { matchesList.innerHTML = '<li>No matches found.</li>'; return; }
	let html = '';
	snap.forEach(doc => {
		const m = doc.data();
		html += `<li>
            <div class="tooltip"><b>${m.ngoName || 'NGO'}</b><span class="tooltiptext">Email: ${m.ngoEmail || 'N/A'}</span></div> | 
            Need: <b>${m.needType}</b> | Location: ${m.requestLocation} | 
            <a href="mailto:${m.ngoEmail || ''}" target="_blank"><button type="button" style="margin-top:0; padding:4px 8px; font-size:0.85rem; background:var(--secondary);">Email</button></a>
            <button type="button" style="margin-top:0; padding:4px 8px; font-size:0.85rem;" onclick="confirmContact('${doc.id}')">Confirm</button>
        </li>`;
	});
	matchesList.innerHTML = html;
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

// Auto-show matches when name is entered
document.getElementById('name').addEventListener('blur', showMatches);
// Also show matches on input for better UX
document.getElementById('name').addEventListener('input', showMatches);
