'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dark CartoDB tiles
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Sample markers (realistic Indian disaster coordinates)
const MARKERS = [
  { lat: 25.5941, lng: 85.1376, type: 'disaster', label: 'Flood Zone — Patna', color: '#ef4444' },
  { lat: 26.1445, lng: 91.7362, type: 'disaster', label: 'Flood Zone — Guwahati', color: '#ef4444' },
  { lat: 25.61,   lng: 85.18,   type: 'volunteer', label: 'You', color: '#60a5fa' },
  { lat: 25.58,   lng: 85.14,   type: 'volunteer', label: 'Volunteer #2', color: '#60a5fa' },
  { lat: 25.62,   lng: 85.12,   type: 'ngo', label: 'Bihar Flood Response Org.', color: '#34d399' },
  { lat: 26.16,   lng: 91.72,   type: 'ngo', label: 'Assam Medical Aid Trust', color: '#34d399' },
  { lat: 25.55,   lng: 85.20,   type: 'shelter', label: 'Relief Shelter A', color: '#fbbf24' },
  { lat: 25.63,   lng: 85.08,   type: 'medical', label: 'Field Medical Camp', color: '#f8fafc' },
];

function makeIcon(color: string, size = 12) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50%;
        border:2px solid rgba(255,255,255,0.5);
        box-shadow:0 0 8px ${color}88;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makeDisasterIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="
          position:absolute;inset:0;
          background:${color}22;
          border-radius:50%;
          border:1.5px solid ${color}55;
          animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position:absolute;inset:4px;
          background:${color};
          border-radius:50%;
          border:2px solid rgba(255,255,255,0.6);
          box-shadow:0 0 10px ${color}cc;
        "></div>
      </div>
      <style>@keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2.5);opacity:0}}</style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [25.61, 85.18],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);

    // Attribution in corner
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add markers
    MARKERS.forEach((m) => {
      const icon = m.type === 'disaster' ? makeDisasterIcon(m.color) : makeIcon(m.color, m.type === 'volunteer' ? 14 : 12);
      L.marker([m.lat, m.lng], { icon })
        .bindPopup(`<div style="background:#0c1a2e;color:#e2e8f0;padding:8px 12px;border-radius:8px;font-size:13px;border:1px solid rgba(255,255,255,0.1)">${m.label}</div>`, {
          className: 'dark-popup',
        })
        .addTo(map);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={mapRef} style={{ height: '380px', width: '100%', background: '#050c18' }} />
  );
}
