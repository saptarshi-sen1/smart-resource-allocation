'use client';

import { motion } from 'framer-motion';
import { TrendingDown, Zap, Award } from 'lucide-react';
import type { OptimizationResult, GreedyResult } from '@/types/optimizer';
import { formatEta } from '@/lib/optimization/eta';

interface GreedyComparisonProps {
  hungarian: OptimizationResult;
  greedy: GreedyResult;
}

interface MetricRowProps {
  label: string;
  hungarianVal: string;
  greedyVal: string;
  improvement: string;
  isPositive: boolean;
}

function MetricRow({ label, hungarianVal, greedyVal, improvement, isPositive }: MetricRowProps) {
  return (
    <div className="grid grid-cols-4 gap-2 py-2.5 border-b border-white/[0.05] last:border-0">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xs font-semibold text-green-400 text-center">{hungarianVal}</div>
      <div className="text-xs font-semibold text-slate-400 text-center">{greedyVal}</div>
      <div className={`text-xs font-bold text-center ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '▼' : '▲'} {improvement}
      </div>
    </div>
  );
}

export function GreedyComparison({ hungarian, greedy }: GreedyComparisonProps) {
  if (hungarian.assignments.length === 0) return null;

  const costImprovement = greedy.totalCost > 0
    ? Math.round(((greedy.totalCost - hungarian.totalCost) / greedy.totalCost) * 100)
    : 0;

  const etaImprovement = greedy.avgEtaMinutes > 0
    ? Math.round(((greedy.avgEtaMinutes - hungarian.avgEtaMinutes) / greedy.avgEtaMinutes) * 100)
    : 0;

  const costDelta = (greedy.totalCost - hungarian.totalCost).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <Award className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Hungarian vs Greedy</h3>
          <p className="text-xs text-slate-500">Why optimal beats nearest-neighbor</p>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 gap-2 mb-1">
        <div className="text-[10px] text-slate-600 uppercase tracking-wider">Metric</div>
        <div className="text-[10px] text-green-500 uppercase tracking-wider text-center font-semibold">Hungarian ★</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider text-center">Greedy</div>
        <div className="text-[10px] text-slate-600 uppercase tracking-wider text-center">Improvement</div>
      </div>

      {/* Metrics */}
      <MetricRow
        label="Total Cost"
        hungarianVal={hungarian.totalCost.toFixed(2)}
        greedyVal={greedy.totalCost.toFixed(2)}
        improvement={`${costImprovement}% (−${costDelta})`}
        isPositive={costImprovement > 0}
      />
      <MetricRow
        label="Avg ETA"
        hungarianVal={formatEta(hungarian.avgEtaMinutes)}
        greedyVal={formatEta(greedy.avgEtaMinutes)}
        improvement={etaImprovement > 0 ? `${etaImprovement}% faster` : 'Similar'}
        isPositive={etaImprovement > 0}
      />
      <MetricRow
        label="Assignments"
        hungarianVal={`${hungarian.matchedCount}`}
        greedyVal={`${greedy.assignments.length}`}
        improvement={`${hungarian.matchedCount - greedy.assignments.length >= 0 ? '+' : ''}${hungarian.matchedCount - greedy.assignments.length}`}
        isPositive={hungarian.matchedCount >= greedy.assignments.length}
      />

      {/* Visual bar comparison */}
      {costImprovement > 0 && (
        <div className="mt-4 p-3 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">
              Hungarian Algorithm saves {costImprovement}% total assignment cost
            </span>
          </div>
          <div className="flex items-end gap-2 h-12">
            {/* Hungarian bar */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full bg-green-500/40 border border-green-500/50 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${100 - costImprovement}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                style={{ maxHeight: '80%' }}
              />
              <span className="text-[9px] text-green-400 font-medium">Hungarian</span>
            </div>
            {/* Greedy bar */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full bg-slate-700/60 border border-slate-600/50 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: '80%' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              />
              <span className="text-[9px] text-slate-500 font-medium">Greedy</span>
            </div>
          </div>
        </div>
      )}

      {/* Runtime note */}
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-600">
        <Zap className="w-3 h-3" />
        Hungarian ran in {hungarian.runtimeMs.toFixed(2)}ms — O(n³) for {hungarian.matchedCount} assignments
      </div>
    </motion.div>
  );
}
