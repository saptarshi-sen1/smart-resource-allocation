'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import type { Assignment } from '@/types/optimizer';
import { formatEta } from '@/lib/optimization/eta';

interface AssignmentCardProps {
  assignment: Assignment;
  rank: number;
  isHighlighted?: boolean;
  showAlternatives?: boolean;
}


/** Three-segment cost breakdown bar */
function CostBreakdownBar({
  etaComponent,
  severityPenalty,
  resourceMismatch,
}: {
  etaComponent: number;
  severityPenalty: number;
  resourceMismatch: number;
}) {
  const total = etaComponent + severityPenalty + resourceMismatch || 1;
  const etaPct = (etaComponent / total) * 100;
  const sevPct = (severityPenalty / total) * 100;
  const resPct = (resourceMismatch / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        <motion.div
          className="bg-sky-500 rounded-l-full"
          style={{ width: `${etaPct}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        <motion.div
          className="bg-amber-500"
          style={{ width: `${sevPct}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
        <motion.div
          className="bg-violet-500 rounded-r-full"
          style={{ width: `${resPct}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
      </div>
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />ETA {etaComponent.toFixed(1)}</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />Severity {severityPenalty}</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />Skills {resourceMismatch.toFixed(1)}</span>
      </div>
    </div>
  );
}

export function AssignmentCard({
  assignment,
  rank,
  isHighlighted = false,
}: AssignmentCardProps) {
  const { costBreakdown, explanation } = assignment;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: rank * 0.06 }}
      className={`rounded-2xl border p-4 transition-all duration-200 ${
        isHighlighted
          ? 'bg-blue-500/[0.06] border-blue-500/25 shadow-lg shadow-blue-500/10'
          : 'bg-white/[0.025] border-white/[0.07] hover:border-white/[0.12]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-400">
            {rank}
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight flex items-center gap-1.5">
              <User className="w-3 h-3 text-blue-400" />
              {assignment.volunteerName}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">
              → {assignment.requestTitle}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-green-400">
            {formatEta(costBreakdown.etaMinutes)}
          </div>
          <div className="text-[10px] text-slate-600">ETA</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/[0.03] rounded-lg px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-600 mb-0.5">Distance</div>
          <div className="text-xs font-semibold text-white">
            {costBreakdown.distanceKm.toFixed(1)} km
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-lg px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-600 mb-0.5">Skills</div>
          <div className={`text-xs font-semibold ${
            costBreakdown.resourceMismatch === 0 ? 'text-green-400' :
            costBreakdown.resourceMismatch <= 5 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {costBreakdown.resourceMismatch === 0 ? 'Perfect' :
             costBreakdown.resourceMismatch <= 5 ? 'Partial' : 'Low'}
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-lg px-2 py-1.5 text-center">
          <div className="text-[10px] text-slate-600 mb-0.5">Total Cost</div>
          <div className="text-xs font-semibold text-white font-mono">
            {costBreakdown.totalCost.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Cost breakdown bar */}
      <div className="mb-3">
        <CostBreakdownBar
          etaComponent={costBreakdown.etaComponent}
          severityPenalty={costBreakdown.severityPenalty}
          resourceMismatch={costBreakdown.resourceMismatch}
        />
      </div>

      {/* Explanation bullets */}
      <div className="space-y-1">
        {explanation.slice(0, 3).map((reason, i) => (
          <div key={i} className="text-[11px] text-slate-400 leading-snug">
            {reason}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
