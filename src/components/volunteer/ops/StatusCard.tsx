'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Navigation,
  CloudRain,
  Zap,
  Clock,
  TrendingUp,
} from 'lucide-react';

// Animated radial progress ring
function ProgressRing({ pct, size = 80, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="url(#ringGrad)" strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Animated counter
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{value}{suffix}</>;
}

export function StatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-6">
        {/* Left — Status info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-base text-slate-500 font-medium uppercase tracking-widest">Operational Status</span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <div className="text-sm text-slate-500 mb-1">Field Status</div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xl font-semibold text-green-400">AVAILABLE</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">Priority Level</div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xl font-semibold text-amber-400">HIGH</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">Active Disaster</div>
              <div className="text-lg font-semibold text-white leading-tight">Flood — Bihar &amp; Assam</div>
              <div className="text-sm text-slate-500 mt-0.5">Category 3 · Declared 18h ago</div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">Nearest Assignment</div>
              <div className="flex items-center gap-1.5 text-lg font-semibold text-white">
                <Navigation className="w-4 h-4 text-blue-400" />
                2.3 km away
              </div>
              <div className="text-sm text-slate-500 mt-0.5">Est. arrival: 8 min</div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">Weather</div>
              <div className="flex items-center gap-1.5 text-lg font-semibold text-slate-200">
                <CloudRain className="w-4 h-4 text-sky-400" />
                28°C · Heavy Rain
              </div>
              <div className="text-sm text-slate-500 mt-0.5">Visibility 2 km</div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">Response Timer</div>
              <div className="flex items-center gap-1.5 text-lg font-semibold text-white">
                <Clock className="w-4 h-4 text-violet-400" />
                04:23 active
              </div>
              <div className="text-sm text-slate-500 mt-0.5">Shift ends in 3h 37m</div>
            </div>
          </div>
        </div>

        {/* Right — Progress ring + score */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="relative">
            <ProgressRing pct={87} size={90} stroke={7} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white tabular-nums">
                <Counter target={87} />
              </span>
              <span className="text-[10px] text-slate-500 font-medium">score</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Resp. Score</div>
            <div className="flex items-center gap-1 mt-1 justify-center">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">+4 this week</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
