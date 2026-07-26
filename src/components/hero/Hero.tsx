'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Map, FileText, Lock, Users, Building2, Activity, CheckCircle2, Navigation, AlertTriangle } from 'lucide-react';

const HERO_GRID_DOTS = [
  { left: 10, top: 20 }, { left: 30, top: 40 }, { left: 70, top: 15 },
  { left: 85, top: 60 }, { left: 20, top: 80 }, { left: 60, top: 75 },
];

const liveDispatches = [
  { id: 'DSP-8921', location: 'Odisha Coastal Sector B', type: 'Flood Relief', status: 'Active Dispatch', urgency: 'High', volunteers: 14 },
  { id: 'DSP-8922', location: 'Bihar Eastern District', type: 'Medical Aid & OCR Scan', status: 'Matching AI', urgency: 'Urgent', volunteers: 8 },
  { id: 'DSP-8920', location: 'Assam Riverine Area', type: 'Shelter & Supply Transport', status: 'En Route', urgency: 'Normal', volunteers: 22 },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 bg-[#06101e] overflow-hidden bg-tech-grid">
      {/* Background radial spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />

      {/* Coordinate & Grid Overlay */}
      <div className="absolute top-20 left-8 hidden xl:flex items-center gap-3 text-[11px] font-mono text-slate-500 tracking-wider">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        GRID: 20.2961° N, 85.8245° E | SYS: OPERATIONAL
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Asymmetric 60/40 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left 60%: Headline & Primary Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Operational Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1.5 text-xs text-blue-400 font-medium"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Humanitarian Coordination Engine</span>
              <span className="w-1 h-1 rounded-full bg-blue-400" />
              <span className="text-slate-400 font-mono text-[11px]">v2.4 Live</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.12] tracking-tight"
            >
              Rapid Disaster Dispatch.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Intelligent Field Response.
              </span>
            </motion.h1>

            {/* Domain-specific Authentic Copy */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed"
            >
              CrisisConnect helps NGOs identify nearby verified volunteers, digitize physical field reports using OCR, and coordinate aid dispatches across affected regions in real time.
            </motion.p>

            {/* Action-Oriented Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5"
              >
                <span>Join as Volunteer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-medium text-sm px-6 py-3.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
              >
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Register Your NGO</span>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-2 transition-colors"
              >
                How CrisisConnect Works →
              </a>
            </motion.div>

            {/* Domain Metrics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] max-w-lg"
            >
              <div>
                <div className="text-xl font-bold text-white font-mono">15,400+</div>
                <div className="text-xs text-slate-400 mt-0.5">Verified Volunteers</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white font-mono">250+</div>
                <div className="text-xs text-slate-400 mt-0.5">Active NGO Partners</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-400 font-mono">1.8km</div>
                <div className="text-xs text-slate-400 mt-0.5">Avg. Response Radius</div>
              </div>
            </motion.div>
          </div>

          {/* Right 40%: Operational Control Center Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-[#0b1325]/90 border border-white/[0.1] rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-white tracking-wide">LIVE DISPATCH FEED</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08]">
                  REAL-TIME
                </span>
              </div>

              {/* Active Dispatches */}
              <div className="space-y-3 mb-4">
                {liveDispatches.map((dispatch) => (
                  <div
                    key={dispatch.id}
                    className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-blue-400 font-medium">{dispatch.id}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        dispatch.urgency === 'High' || dispatch.urgency === 'Urgent'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {dispatch.urgency}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white">{dispatch.location}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-slate-500" /> {dispatch.type}
                      </span>
                      <span className="text-slate-300 font-mono">{dispatch.volunteers} matched</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Matching Telemetry Card */}
              <div className="bg-gradient-to-r from-blue-900/30 to-slate-900/30 border border-blue-500/20 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white">AI Proximity Match Engine</span>
                  </div>
                  <span className="text-[11px] font-mono text-green-400">98.4% Match</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-normal">
                  Proximity search active across <span className="text-white font-medium">14 active sectors</span>. Ranking nearest volunteers by certified skills & vehicle availability.
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
