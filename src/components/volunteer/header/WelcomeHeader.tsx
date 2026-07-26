'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, ChevronDown, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

type Availability = 'Available' | 'Busy' | 'Off Duty';

const AVAILABILITY_STYLES: Record<Availability, string> = {
  Available: 'bg-green-500/15 text-green-400 border-green-500/30',
  Busy: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Off Duty': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const DOT_STYLES: Record<Availability, string> = {
  Available: 'bg-green-400',
  Busy: 'bg-amber-400',
  'Off Duty': 'bg-slate-500',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const [availability, setAvailability] = useState<Availability>('Available');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Volunteer';
  const greeting = getGreeting();

  const timeStr = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = currentTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex items-start justify-between gap-6 px-8 pt-8 pb-6 border-b border-white/[0.06]"
    >
      {/* Left — Greeting */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-slate-500 text-lg">{greeting},</span>
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight leading-none mb-3">
          {displayName}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-base text-slate-400">
            <Activity className="w-4 h-4 text-blue-400" />
            Volunteer · Medical Response Team
          </span>
          <span className="text-slate-700">·</span>
          <span className="inline-flex items-center gap-1 text-base text-amber-400/90">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Level 3 Responder
          </span>
          <span className="text-slate-700">·</span>
          <span className="inline-flex items-center gap-1.5 text-base text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            Kolkata, West Bengal
          </span>
        </div>
      </div>

      {/* Right — Controls */}
      <div className="flex flex-col items-end gap-3 flex-shrink-0">
        {/* Time */}
        <div className="text-right">
          <div className="text-2xl font-semibold text-white tabular-nums">{timeStr}</div>
          <div className="text-sm text-slate-500">{dateStr}</div>
        </div>

        {/* Availability toggle */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-base font-medium transition-all ${AVAILABILITY_STYLES[availability]}`}
          >
            <div className={`w-2 h-2 rounded-full ${DOT_STYLES[availability]} ${availability === 'Available' ? 'animate-pulse' : ''}`} />
            {availability}
            <ChevronDown className="w-4 h-4 opacity-60" />
          </button>

          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-full mt-1.5 w-40 bg-[#0c1a2e] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {(['Available', 'Busy', 'Off Duty'] as Availability[]).map((status) => (
                <button
                  key={status}
                  onClick={() => { setAvailability(status); setShowDropdown(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${DOT_STYLES[status]}`} />
                  {status}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Response score */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm text-slate-500">Avg response: <span className="text-slate-300 font-medium">4.2 min</span></span>
        </div>
      </div>
    </motion.div>
  );
}
