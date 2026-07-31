'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Circle, XCircle, MapPin, Building2 } from 'lucide-react';

type AssignmentStatus = 'in-progress' | 'accepted' | 'completed' | 'cancelled';

interface Assignment {
  id: string;
  title: string;
  ngo: string;
  location: string;
  date: string;
  duration: string;
  status: AssignmentStatus;
}

const ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    title: 'Flood Relief Distribution',
    ngo: 'Bihar Flood Response Org.',
    location: 'Patna North Zone',
    date: 'Jul 25, 2026',
    duration: '7 hours',
    status: 'in-progress',
  },
  {
    id: 'a2',
    title: 'Medical Camp Support',
    ngo: 'Assam Medical Aid Trust',
    location: 'Guwahati Relief Camp',
    date: 'Jul 23, 2026',
    duration: '5 hours',
    status: 'accepted',
  },
  {
    id: 'a3',
    title: 'Shelter Setup — Cyclone Remal',
    ngo: 'Coastal Aid Network',
    location: 'Digha, WB',
    date: 'Jul 20, 2026',
    duration: '4 hours',
    status: 'completed',
  },
  {
    id: 'a4',
    title: 'Food Distribution Drive',
    ngo: 'National Relief Society',
    location: 'Midnapore South',
    date: 'Jul 18, 2026',
    duration: '3 hours',
    status: 'completed',
  },
  {
    id: 'a5',
    title: 'Evacuation Support',
    ngo: 'NDRF Local Unit',
    location: 'Sunderban Delta',
    date: 'Jul 15, 2026',
    duration: 'Cancelled',
    status: 'cancelled',
  },
];

const STATUS_CONFIG: Record<AssignmentStatus, {
  icon: React.ElementType;
  dotClass: string;
  lineClass: string;
  badgeClass: string;
  label: string;
}> = {
  'in-progress': {
    icon: Clock,
    dotClass: 'bg-blue-500 border-blue-400 shadow-blue-500/50 shadow-md',
    lineClass: 'bg-blue-500/30',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    label: 'In Progress',
  },
  accepted: {
    icon: Circle,
    dotClass: 'bg-amber-500 border-amber-400',
    lineClass: 'bg-amber-500/20',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    label: 'Accepted',
  },
  completed: {
    icon: CheckCircle2,
    dotClass: 'bg-green-500/30 border-green-500',
    lineClass: 'bg-green-500/15',
    badgeClass: 'bg-green-500/10 text-green-500 border-green-500/20',
    label: 'Completed',
  },
  cancelled: {
    icon: XCircle,
    dotClass: 'bg-slate-700 border-slate-600',
    lineClass: 'bg-slate-700/30',
    badgeClass: 'bg-slate-700/30 text-slate-500 border-slate-700',
    label: 'Cancelled',
  },
};

export function AssignmentTimeline() {
  return (
    <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-white">My Assignments</h2>
        <span className="text-base text-slate-500">{ASSIGNMENTS.filter((a) => a.status !== 'cancelled').length} active / total {ASSIGNMENTS.length}</span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/[0.06]" />

        <div className="space-y-4">
          {ASSIGNMENTS.map((assignment, i) => {
            const cfg = STATUS_CONFIG[assignment.status];
            const isCancelled = assignment.status === 'cancelled';

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="flex gap-4 relative"
              >
                {/* Timeline dot */}
                <div className="flex-shrink-0 z-10">
                  <div className={`w-10 h-10 rounded-full border-2 ${cfg.dotClass} flex items-center justify-center ${assignment.status === 'in-progress' ? 'animate-pulse' : ''}`}>
                    <cfg.icon className={`w-4 h-4 ${assignment.status === 'completed' ? 'text-green-400' : assignment.status === 'cancelled' ? 'text-slate-500' : 'text-white'}`} />
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 bg-white/[0.025] border border-white/[0.06] rounded-xl p-4 mb-1 ${isCancelled ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className={`text-lg font-semibold leading-tight ${isCancelled ? 'line-through text-slate-500' : 'text-white'}`}>
                      {assignment.title}
                    </h3>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wide ${cfg.badgeClass}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-base text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {assignment.ngo}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {assignment.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {assignment.date} · {assignment.duration}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
