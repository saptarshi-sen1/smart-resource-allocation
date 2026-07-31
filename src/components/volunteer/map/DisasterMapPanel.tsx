'use client';

import dynamic from 'next/dynamic';
import { Layers, Navigation2, AlertCircle } from 'lucide-react';

// Lazy load Leaflet — MUST be SSR-disabled
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] rounded-xl bg-[#050c18] flex items-center justify-center border border-white/[0.05]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-base">Loading operational map…</p>
      </div>
    </div>
  ),
});

const LEGEND = [
  { color: 'bg-red-500', label: 'Disaster Zone', pulse: true },
  { color: 'bg-blue-400', label: 'Volunteers' },
  { color: 'bg-green-400', label: 'NGO Camps' },
  { color: 'bg-amber-400', label: 'Shelters' },
  { color: 'bg-white', label: 'Medical Units' },
];

export function DisasterMapPanel() {
  return (
    <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <Navigation2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Live Operations Map</h2>
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all">
            <Layers className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all">
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <LeafletMap />

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 bg-[#06101e]/90 backdrop-blur-sm border border-white/[0.1] rounded-xl px-3 py-2.5 z-[1000]">
          <div className="space-y-1.5">
            {LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0 ${item.pulse ? 'animate-pulse' : ''}`} />
                <span className="text-xs text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
