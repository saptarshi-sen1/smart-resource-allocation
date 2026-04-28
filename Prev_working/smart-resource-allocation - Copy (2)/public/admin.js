// --- Analytics Section ---
// Leaflet and Chart.js are loaded via script tags in admin.html and available as globals
// Use window.L and window.Chart

const Chart = window.Chart;
const L = window.L;

let analyticsMap, volunteerMarkers = [], ngoMarkers = [];
let skillsChart, urgencyChart, volunteersPerMonthChart;

function filterByTime(data, dateField, filter) {
	const now = new Date();
	return data.filter(item => {
		const d = new Date(item[dateField]);
		if (filter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
		if (filter === 'year') return d.getFullYear() === now.getFullYear();
		return true;
	});
}

function renderAnalytics() {
	// Map
	if (!analyticsMap) {
		analyticsMap = L.map('analyticsMap').setView([20.5937, 78.9629], 4);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(analyticsMap);
	}
	// Remove old markers
	volunteerMarkers.forEach(m => analyticsMap.removeLayer(m));
	ngoMarkers.forEach(m => analyticsMap.removeLayer(m));
	volunteerMarkers = [];
	ngoMarkers = [];

	const filter = document.getElementById('mapTimeFilter').value;
	const filteredVolunteers = filterByTime(volunteers, 'createdAt', filter);
	const filteredNgos = filterByTime(ngos, 'createdAt', filter);
	filteredVolunteers.forEach(v => {
		if (v.latitude && v.longitude) {
			const marker = L.marker([v.latitude, v.longitude], {icon: L.icon({iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png', iconSize: [24, 24]})}).addTo(analyticsMap);
			marker.bindPopup(`<b>${v.name}</b><br>Skills: ${(v.skills || []).join(', ')}`);
			volunteerMarkers.push(marker);
		}
	});
	filteredNgos.forEach(n => {
		if (n.latitude && n.longitude) {
			const marker = L.marker([n.latitude, n.longitude], {icon: L.icon({iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [24, 24]})}).addTo(analyticsMap);
			marker.bindPopup(`<b>${n.needType}</b><br>Location: ${n.location}`);
			ngoMarkers.push(marker);
		}
	});

	// Skills Chart
	const skillCounts = {};
	volunteers.forEach(v => (v.skills || []).forEach(s => { skillCounts[s] = (skillCounts[s] || 0) + 1; }));
	const skillLabels = Object.keys(skillCounts);
	const skillData = Object.values(skillCounts);
	if (skillsChart) skillsChart.destroy();
	skillsChart = new Chart(document.getElementById('skillsChart').getContext('2d'), {
		type: 'bar',
		data: { labels: skillLabels, datasets: [{ label: 'Volunteers per Skill', data: skillData, backgroundColor: '#4e79a7' }] },
		options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
	});

	// Urgency Chart
	const urgencyCounts = { Low: 0, Medium: 0, High: 0 };
	ngos.forEach(n => { if (n.urgency) urgencyCounts[n.urgency] = (urgencyCounts[n.urgency] || 0) + 1; });
	if (urgencyChart) urgencyChart.destroy();
	urgencyChart = new Chart(document.getElementById('urgencyChart').getContext('2d'), {
		type: 'pie',
		data: { labels: Object.keys(urgencyCounts), datasets: [{ data: Object.values(urgencyCounts), backgroundColor: ['#a0cbe8', '#f28e2b', '#e15759'] }] },
		options: { responsive: true, maintainAspectRatio: false }
	});

	// Volunteers Per Month Chart
	const monthCounts = {};
	volunteers.forEach(v => {
		const d = new Date(v.createdAt);
		const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
		monthCounts[key] = (monthCounts[key] || 0) + 1;
	});
	const monthLabels = Object.keys(monthCounts);
	const monthData = Object.values(monthCounts);
	if (volunteersPerMonthChart) volunteersPerMonthChart.destroy();
	volunteersPerMonthChart = new Chart(document.getElementById('volunteersPerMonthChart').getContext('2d'), {
		type: 'line',
		data: { labels: monthLabels, datasets: [{ label: 'Volunteers Joined', data: monthData, borderColor: '#59a14f', fill: false }] },
		options: { responsive: true, maintainAspectRatio: false }
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const filterEl = document.getElementById('mapTimeFilter');
	if (filterEl) filterEl.addEventListener('change', renderAnalytics);
});
import { db } from "./firebase.js";
import {
	collection,
	getDocs,
	query,
	orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const adminMatchesList = document.getElementById('adminMatchesList');
const searchInput = document.getElementById('searchInput');
const sortBtn = document.getElementById('sortBtn');
const ngoList = document.getElementById('ngoList');
const volunteerList = document.getElementById('volunteerList');
let matches = [];
let ngos = [];
let volunteers = [];
let sortDesc = true;

async function loadMatches() {
	adminMatchesList.innerHTML = 'Loading...';
	ngoList.innerHTML = 'Loading...';
	volunteerList.innerHTML = 'Loading...';
	// Load confirmed matches
	const q = query(collection(db, 'confirmedMatches'), orderBy('confirmedAt', sortDesc ? 'desc' : 'asc'));
	const snap = await getDocs(q);
	matches = [];
	snap.forEach(doc => matches.push(doc.data()));
	renderMatches();
	// Load all NGO requests
	const ngoSnap = await getDocs(query(collection(db, 'requests'), orderBy('createdAt', 'desc')));
	ngos = [];
	ngoSnap.forEach(doc => ngos.push(doc.data()));
	renderNgos();
	// Load all volunteers
	const volunteerSnap = await getDocs(query(collection(db, 'volunteers'), orderBy('createdAt', 'desc')));
	volunteers = [];
	volunteerSnap.forEach(doc => volunteers.push(doc.data()));
	renderVolunteers();
	renderAnalytics();
}

function renderMatches() {
	       let filtered = matches;
	       const search = searchInput.value.trim().toLowerCase();
	       if (search) {
		       filtered = matches.filter(m => {
			       return Object.values(m).some(val =>
				       (val || '').toString().toLowerCase().includes(search)
			       );
		       });
	       }
	       adminMatchesList.innerHTML = '';
	       if (filtered.length === 0) {
		       adminMatchesList.innerHTML = '<li>No matches found.</li>';
		       return;
	       }
	       filtered.forEach(m => {
		       const li = document.createElement('li');
		       li.innerHTML = `
			       <strong>Volunteer:</strong> ${m.volunteerName || 'N/A'}<br>
			       <strong>Volunteer Location:</strong> ${m.volunteerLocation || 'N/A'}<br>
			       <strong>NGO Need:</strong> ${m.needType || 'N/A'}<br>
			       <strong>Request Location:</strong> ${m.requestLocation || 'N/A'}<br>
			       <strong>Score:</strong> ${m.score || 'N/A'}<br>
			       <strong>Confirmed At:</strong> ${m.confirmedAt || 'N/A'}
		       `;
		       adminMatchesList.appendChild(li);
	       });
}

function renderNgos() {
       ngoList.innerHTML = '';
       if (ngos.length === 0) {
	       ngoList.innerHTML = '<li>No NGO requests found.</li>';
	       return;
       }
       ngos.forEach((n, i) => {
	       const li = document.createElement('li');
	       li.innerHTML = `
		       <strong>Need:</strong> ${n.needType || 'N/A'}<br>
		       <strong>Location:</strong> ${n.location || 'N/A'}<br>
		       <strong>Urgency:</strong> ${n.urgency || 'N/A'}<br>
		       <strong>People Affected:</strong> ${n.peopleAffected || 'N/A'}<br>
		       <strong>Verified:</strong> ${n.verified ? 'Yes' : 'No'}<br>
		       <strong>AI Summary:</strong> ${n.aiSummary || ''}<br>
		       <strong>Genuineness:</strong> ${n.aiGenuineness || ''}<br>
		       <strong>Created At:</strong> ${n.createdAt || 'N/A'}<br>
		       <button type="button" onclick="window.selectRequest(${i})">Select for Manual Match</button>
	       `;
	       ngoList.appendChild(li);
       });
}

function renderVolunteers() {
       volunteerList.innerHTML = '';
       if (volunteers.length === 0) {
	       volunteerList.innerHTML = '<li>No volunteers found.</li>';
	       return;
       }
       volunteers.forEach((v, i) => {
	       const li = document.createElement('li');
	       li.innerHTML = `
		       <strong>Name:</strong> ${v.name || 'N/A'}<br>
		       <strong>Skills:</strong> ${(v.skills || []).join(', ')}<br>
		       <strong>Location:</strong> ${v.location || 'N/A'}<br>
		       <strong>Availability:</strong> ${v.availability || 'N/A'}<br>
		       <strong>Verified:</strong> ${v.verified ? 'Yes' : 'No'}<br>
		       <strong>Created At:</strong> ${v.createdAt || 'N/A'}<br>
		       <button type="button" onclick="window.selectVolunteer(${i})">Select for Manual Match</button>
	       `;
	       volunteerList.appendChild(li);
       });
}

// Manual matching logic
let selectedRequest = null;
let selectedVolunteer = null;

function updateSelectedPairDisplay() {
	const display = document.getElementById('selectedPairDisplay');
	const createBtn = document.getElementById('createManualMatchBtn');
	const clearBtn = document.getElementById('clearManualMatchBtn');
	let html = '';
	if (selectedRequest) {
		html += `<b>Selected NGO:</b> ${selectedRequest.needType || ''} (${selectedRequest.location || ''})`;
	}
	if (selectedVolunteer) {
		if (html) html += ' <b>&rarr;</b> ';
		html += `<b>Selected Volunteer:</b> ${selectedVolunteer.name || ''} (${selectedVolunteer.location || ''})`;
	}
	if (!selectedRequest && !selectedVolunteer) {
		html = '<i>No NGO or volunteer selected.</i>';
	}
	display.innerHTML = html;
	// Show create button only if both are selected
	createBtn.style.display = (selectedRequest && selectedVolunteer) ? '' : 'none';
	clearBtn.style.display = (selectedRequest || selectedVolunteer) ? '' : 'none';
}

window.selectRequest = function(idx) {
	selectedRequest = ngos[idx];
	updateSelectedPairDisplay();
	// Optionally scroll to volunteer list
	document.getElementById('volunteerList').scrollIntoView({behavior:'smooth'});
};

window.selectVolunteer = function(idx) {
	selectedVolunteer = volunteers[idx];
	updateSelectedPairDisplay();
	// Optionally scroll to top to show pair
	document.getElementById('manualMatchBox').scrollIntoView({behavior:'smooth'});
};

document.getElementById('createManualMatchBtn').onclick = async function() {
	if (!selectedRequest || !selectedVolunteer) return;
	try {
		await addMatch(selectedVolunteer, selectedRequest);
		alert('Manual match created!');
		selectedRequest = null;
		selectedVolunteer = null;
		updateSelectedPairDisplay();
		loadMatches();
	} catch (err) {
		alert('Error creating manual match.');
	}
};

document.getElementById('clearManualMatchBtn').onclick = function() {
	selectedRequest = null;
	selectedVolunteer = null;
	updateSelectedPairDisplay();
};

// Initial display
updateSelectedPairDisplay();
async function addMatch(volunteer, request) {
			// Add to matches collection
			await firebaseAddDoc(collection(db, 'matches'), {
				volunteerName: volunteer.name,
				volunteerLocation: volunteer.location,
				needType: request.needType,
				requestLocation: request.location,
				score: 'Manual',
				createdAt: new Date().toISOString()
			});
		}

		// Patch Firestore addDoc for admin.js scope
		import { addDoc as firebaseAddDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

searchInput.addEventListener('input', renderMatches);
sortBtn.addEventListener('click', () => { sortDesc = !sortDesc; loadMatches(); });

// Initial load
loadMatches();

// Seed Database Functionality
document.getElementById('seedDataBtn').addEventListener('click', async () => {
	const seedBtn = document.getElementById('seedDataBtn');
	seedBtn.disabled = true;
	seedBtn.innerText = 'Seeding...';
	
	const dummyVolunteers = [
		{ name: 'Alice Smith', skills: ['medical'], location: 'Mumbai', latitude: 19.0760, longitude: 72.8777, verified: true, availability: 'available' },
		{ name: 'Bob Jones', skills: ['rescue', 'basic relief'], location: 'Delhi', latitude: 28.7041, longitude: 77.1025, verified: true, availability: 'available' },
		{ name: 'Charlie Brown', skills: ['technical', 'digital'], location: 'Bangalore', latitude: 12.9716, longitude: 77.5946, verified: true, availability: 'available' },
		{ name: 'Diana Prince', skills: ['medical', 'specialized'], location: 'Chennai', latitude: 13.0827, longitude: 80.2707, verified: true, availability: 'available' },
		{ name: 'Evan Wright', skills: ['basic relief'], location: 'Kolkata', latitude: 22.5726, longitude: 88.3639, verified: false, availability: 'available' }
	];

	try {
		for (const v of dummyVolunteers) {
			v.createdAt = new Date().toISOString();
			v.uniqueKey = Math.random().toString(36).substr(2, 8).toUpperCase();
			await firebaseAddDoc(collection(db, 'volunteers'), v);
		}
		alert('Successfully added 5 dummy volunteers!');
		loadMatches(); // Reload to show new volunteers
	} catch (err) {
		console.error('Error seeding data:', err);
		alert('Failed to seed data. Check console.');
	} finally {
		seedBtn.disabled = false;
		seedBtn.innerText = 'Seed Dummy Volunteers';
	}
});
