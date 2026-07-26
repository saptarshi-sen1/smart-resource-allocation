'use client';

import { motion } from 'framer-motion';
import { Zap, FileText, Lock, Map, Shield, Smartphone, ArrowUpRight, CheckCircle2, Scan, Users, Server } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-[#06101e] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1 text-xs text-blue-400 font-medium mb-3">
            Core Infrastructure
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Engineered for High-Stakes Operations
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            CrisisConnect combines proximity algorithms, document OCR, and secure resource key exchange into a unified coordination suite.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bento Item 1: Large Featured Card — AI Volunteer Dispatch Engine (Span 2 Cols, Span 2 Rows) */}
          <div className="md:col-span-2 md:row-span-2 bg-[#0b1325]/80 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 flex flex-col justify-between transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded border border-white/[0.06]">
                  PROXIMITY ALGORITHM
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                AI Volunteer Proximity & Skill Dispatch
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg mb-6">
                Ranks available volunteers based on real-time distance to disaster sites, verified skill sets (first aid, heavy logistics, medical), and equipment availability.
              </p>
            </div>

            {/* Simulated AI Ranking Interface Preview */}
            <div className="bg-[#06101e] border border-white/[0.08] rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.06]">
                <span>MATCH RANKING</span>
                <span>DISTANCE / SKILL MATCH</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Arjun Sharma (Medical Cert)</span>
                </div>
                <span className="text-blue-400 font-semibold">1.2 km • 98.4% Match</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-700 inline-block" />
                  <span>Priya Das (Heavy Logistics)</span>
                </div>
                <span className="text-slate-400">2.8 km • 91.2% Match</span>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Wide Card — OCR Field Report Scanner (Span 1 Col) */}
          <div className="bg-[#0b1325]/80 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 flex flex-col justify-between transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Scan className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-violet-400">Tesseract.js</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                Field Report OCR Digitization
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Scans handwritten physical incident reports from the field and extracts structured data automatically.
              </p>
            </div>

            <div className="bg-[#06101e] border border-white/[0.08] rounded-xl p-3 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between text-[11px] text-violet-400 mb-1">
                <span>OCR CONFIDENCE</span>
                <span>96.2%</span>
              </div>
              <div className="text-slate-400 truncate">Parsed: &quot;Need 500 Medical Kits at Sub-sector 4&quot;</div>
            </div>
          </div>

          {/* Bento Item 3: Secure Resource Allocation */}
          <div className="bg-[#0b1325]/80 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
              Two-Way Key Allocation
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cryptographic handover keys ensure aid supplies reach verified recipients without diversion or loss.
            </p>
          </div>

          {/* Bento Item 4: Interactive GIS GIS Leaflet Mapping */}
          <div className="bg-[#0b1325]/80 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
              Real-Time GIS Mapping
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Leaflet-powered spatial visualization of incident zones, active volunteer clusters, and supply routes.
            </p>
          </div>

          {/* Bento Item 5: Enterprise Auth & Android Compatibility */}
          <div className="bg-[#0b1325]/80 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              Android WebView Native SDK
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pre-configured WebView architecture with User-Agent spoofing for seamless Google OAuth on mobile devices.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
