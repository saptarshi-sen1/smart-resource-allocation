'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Waves,
  Flame,
  Wind,
  Mountain,
  MapPin,
  Users,
  Clock,
  Zap,
  CheckCircle,
  Eye,
  Phone,
  Brain,
  ChevronRight,
} from 'lucide-react';

type Urgency = 'CRITICAL' | 'HIGH' | 'MEDIUM';
type FilterTab = 'All' | 'Nearby' | 'Critical';

interface Mission {
  id: string;
  type: string;
  icon: React.ElementType;
  iconColor: string;
  location: string;
  district: string;
  distance: string;
  urgency: Urgency;
  affected: number;
  skills: string[];
  equipment: string[];
  duration: string;
  aiMatch: number;
  ngo: string;
  postedAgo: string;
}

const MISSIONS: Mission[] = [
  {
    id: 'm1',
    type: 'Flood Relief',
    icon: Waves,
    iconColor: 'text-sky-400',
    location: 'Patna North Zone',
    district: 'Patna, Bihar',
    distance: '2.3 km',
    urgency: 'CRITICAL',
    affected: 3400,
    skills: ['First Aid', 'Boat Operation', 'Water Rescue'],
    equipment: ['Life jacket', 'Rope kit', 'Waterproof kit'],
    duration: '6–8 hours',
    aiMatch: 98,
    ngo: 'Bihar Flood Response Org.',
    postedAgo: '14 min ago',
  },
  {
    id: 'm2',
    type: 'Medical Emergency',
    icon: Flame,
    iconColor: 'text-red-400',
    location: 'Guwahati Relief Camp',
    district: 'Kamrup, Assam',
    distance: '5.1 km',
    urgency: 'HIGH',
    affected: 1200,
    skills: ['First Aid', 'Triage', 'CPR Certified'],
    equipment: ['Medical kit', 'Stretcher'],
    duration: '4–6 hours',
    aiMatch: 91,
    ngo: 'Assam Medical Aid Trust',
    postedAgo: '38 min ago',
  },
  {
    id: 'm3',
    type: 'Cyclone Evacuation',
    icon: Wind,
    iconColor: 'text-violet-400',
    location: 'Digha Coastal Zone',
    district: 'Purba Medinipur, WB',
    distance: '18 km',
    urgency: 'MEDIUM',
    affected: 870,
    skills: ['Communication', 'Crowd Management'],
    equipment: ['Megaphone', 'Reflective vest'],
    duration: '3–4 hours',
    aiMatch: 78,
    ngo: 'Coastal Aid Network',
    postedAgo: '1.2 hrs ago',
  },
];

const URGENCY_STYLES: Record<Urgency, string> = {
  CRITICAL: 'bg-red-500/15 text-red-400 border border-red-500/30',
  HIGH: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
};

const MATCH_COLOR = (pct: number) =>
  pct >= 90 ? 'text-green-400' : pct >= 75 ? 'text-amber-400' : 'text-slate-400';

const FILTER_TABS: FilterTab[] = ['All', 'Nearby', 'Critical'];

export function MissionFeed() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const filtered = MISSIONS.filter((m) => {
    if (activeFilter === 'Nearby') return parseFloat(m.distance) < 6;
    if (activeFilter === 'Critical') return m.urgency === 'CRITICAL';
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Active Mission Requests</h2>
          <p className="text-base text-slate-500 mt-0.5">{filtered.length} open near your location</p>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-base font-medium transition-all ${
                activeFilter === tab
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Mission Cards */}
      <AnimatePresence mode="popLayout">
        {filtered.map((mission, i) => {
          const isAccepted = accepted.has(mission.id);
          return (
            <motion.div
              key={mission.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className={`bg-[#080f1d] border rounded-2xl p-5 transition-all duration-200 hover:border-white/[0.12] ${
                isAccepted ? 'border-green-500/25' : 'border-white/[0.07]'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                    <mission.icon className={`w-5 h-5 ${mission.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-white">{mission.type}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${URGENCY_STYLES[mission.urgency]}`}>
                        {mission.urgency}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-base text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {mission.district}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span>{mission.distance}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-500">{mission.postedAgo}</span>
                    </div>
                  </div>
                </div>

                {/* AI Match */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-2xl font-bold ${MATCH_COLOR(mission.aiMatch)}`}>{mission.aiMatch}%</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                    <Brain className="w-3 h-3" /> AI Match
                  </div>
                </div>
              </div>

              {/* Middle stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/[0.03] rounded-xl px-3 py-2.5">
                  <div className="text-xs text-slate-500 mb-1">Affected</div>
                  <div className="flex items-center gap-1.5 text-base font-semibold text-white">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {mission.affected.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/[0.03] rounded-xl px-3 py-2.5">
                  <div className="text-xs text-slate-500 mb-1">Duration</div>
                  <div className="flex items-center gap-1.5 text-base font-semibold text-white">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {mission.duration}
                  </div>
                </div>
                <div className="bg-white/[0.03] rounded-xl px-3 py-2.5">
                  <div className="text-xs text-slate-500 mb-1">NGO</div>
                  <div className="text-base font-semibold text-white truncate">{mission.ngo.split(' ').slice(0, 2).join(' ')}</div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {mission.skills.map((skill) => (
                  <span key={skill} className="flex items-center gap-1 text-sm px-2.5 py-1 bg-blue-500/[0.08] border border-blue-500/20 text-blue-300 rounded-lg">
                    <Zap className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
                {mission.equipment.map((eq) => (
                  <span key={eq} className="text-sm px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] text-slate-400 rounded-lg">
                    {eq}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.05]">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setAccepted((s) => { const n = new Set(s); if (isAccepted) n.delete(mission.id); else n.add(mission.id); return n; })}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isAccepted
                      ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {isAccepted ? 'Accepted' : 'Accept Mission'}
                </motion.button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-lg font-medium text-slate-400 border border-white/[0.07] hover:border-white/[0.15] hover:text-white transition-all">
                  <Eye className="w-4 h-4" />
                  View Map
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-lg font-medium text-slate-400 border border-white/[0.07] hover:border-white/[0.15] hover:text-white transition-all">
                  <Phone className="w-4 h-4" />
                  Contact NGO
                </button>
                <button className="ml-auto text-slate-600 hover:text-slate-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
