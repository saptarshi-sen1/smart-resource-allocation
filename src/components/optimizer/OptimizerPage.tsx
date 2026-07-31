'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Clock, Target, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { useOptimizerStore } from '@/store/useOptimizerStore';
import { AssignmentCard } from './AssignmentCard';
import { CostMatrixHeatmap } from './CostMatrixHeatmap';
import { AssignmentFlow } from './AssignmentFlow';
import { GreedyComparison } from './GreedyComparison';
import { DemoControls } from './DemoControls';
import { DEMO_VOLUNTEERS, DEMO_REQUESTS } from '@/services/demoDataService';
import { formatEta } from '@/lib/optimization/eta';

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const { result, greedyResult, isRunning } = useOptimizerStore();

  if (!result && !isRunning) return null;

  const costReduction = result && greedyResult && greedyResult.totalCost > 0
    ? Math.round(((greedyResult.totalCost - result.totalCost) / greedyResult.totalCost) * 100)
    : 0;

  const stats = result ? [
    { icon: Target, label: 'Optimal Assignments', value: `${result.matchedCount}`, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { icon: Clock, label: 'Avg ETA', value: formatEta(result.avgEtaMinutes), color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { icon: TrendingDown, label: 'Total Cost', value: result.totalCost.toFixed(2), color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { icon: Zap, label: 'Runtime', value: `${result.runtimeMs.toFixed(1)}ms`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Activity, label: 'Cost Reduction', value: `${costReduction}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ] : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`${s.bg} border rounded-xl p-3 flex items-center gap-2.5`}
        >
          <s.icon className={`w-4 h-4 ${s.color} flex-shrink-0`} />
          <div>
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 leading-tight">{s.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function OptimizerPage() {
  const { result, greedyResult, isRunning, error } = useOptimizerStore();

  // Build assignment array for heatmap: assignmentForHeatmap[volIdx] = reqIdx
  const assignmentForHeatmap: number[] = [];
  if (result) {
    for (const a of result.assignments) {
      const vi = DEMO_VOLUNTEERS.findIndex((v) => v.id === a.volunteerId);
      const ri = DEMO_REQUESTS.findIndex((r) => r.id === a.requestId);
      if (vi >= 0 && ri >= 0) assignmentForHeatmap[vi] = ri;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">AI Assignment Optimizer</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/25 uppercase tracking-wide">
              Hungarian Algorithm
            </span>
          </div>
          <p className="text-sm text-slate-500 ml-10">
            Globally optimal volunteer–request assignments using the Kuhn–Munkres algorithm.
            Minimizes total operational cost across all assignments simultaneously.
          </p>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <StatsBar />

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left — Controls + Comparison */}
        <div className="space-y-4">
          <DemoControls />

          {result && greedyResult && (
            <GreedyComparison hungarian={result} greedy={greedyResult} />
          )}

          {/* Algorithm info card */}
          <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">Algorithm</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="text-violet-400 font-medium">Hungarian (Kuhn–Munkres)</span>
              </div>
              <div className="flex justify-between">
                <span>Time complexity</span>
                <span className="text-white font-mono">O(n³)</span>
              </div>
              <div className="flex justify-between">
                <span>Optimality</span>
                <span className="text-green-400">Global minimum cost</span>
              </div>
              <div className="flex justify-between">
                <span>ETA weight</span>
                <span className="text-white font-mono">50%</span>
              </div>
              <div className="flex justify-between">
                <span>Severity weight</span>
                <span className="text-white font-mono">30%</span>
              </div>
              <div className="flex justify-between">
                <span>Skill match weight</span>
                <span className="text-white font-mono">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center — Flow + Matrix */}
        <div className="space-y-4">
          {/* Assignment flow visualization */}
          <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Assignment Flow</h3>
              {result && (
                <span className="text-xs text-green-400">
                  {result.matchedCount} optimal matches
                </span>
              )}
            </div>
            <div style={{ height: 320 }}>
              <AssignmentFlow
                volunteers={DEMO_VOLUNTEERS}
                requests={DEMO_REQUESTS}
                assignments={result?.assignments ?? []}
              />
            </div>
          </div>

          {/* Cost matrix heatmap */}
          <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Cost Matrix</h3>
              <span className="text-xs text-slate-500">
                {result ? `${result.volunteerLabels.length} × ${result.requestLabels.length}` : 'N × M'}
              </span>
            </div>
            {isRunning ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : (
              <CostMatrixHeatmap
                matrix={result?.matrix ?? []}
                volunteerLabels={result?.volunteerLabels ?? []}
                requestLabels={result?.requestLabels ?? []}
                assignment={assignmentForHeatmap}
              />
            )}
          </div>
        </div>

        {/* Right — Assignment cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Optimal Assignments</h3>
            {result && (
              <span className="text-xs text-slate-500">
                {result.matchedCount} matched · {result.unfilledCount} unfilled
              </span>
            )}
          </div>

          {isRunning && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {!isRunning && !result && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Brain className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">Click &quot;Run Demo Optimization&quot;</p>
              <p className="text-xs text-slate-600 mt-1">to see AI assignments</p>
            </div>
          )}


          {result && !isRunning && (
            <AnimatePresence mode="wait">
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                {result.assignments.map((a, i) => (
                  <AssignmentCard
                    key={`${a.volunteerId}-${a.requestId}`}
                    assignment={a}
                    rank={i + 1}
                    isHighlighted={i === 0}
                  />
                ))}
                {result.unfilledCount > 0 && (
                  <div className="p-3 bg-amber-500/[0.05] border border-amber-500/20 rounded-xl text-xs text-amber-400">
                    ⚠ {result.unfilledCount} request(s) unfilled — insufficient available volunteers
                  </div>
                )}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
