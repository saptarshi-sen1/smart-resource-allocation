'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOptimizerStore } from '@/store/useOptimizerStore';
import { Brain, MapPin, Zap, Clock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Confidence bar helper
function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
      <span className="text-base font-semibold text-green-400 tabular-nums w-12 text-right">{value}%</span>
    </div>
  );
}

// Maps emojis in the assignment explanations to appropriate Lucide icons
function getIconForReason(text: string) {
  if (text.includes('📍')) return MapPin;
  if (text.includes('✅') || text.includes('⚠️')) return Zap;
  if (text.includes('🟢') || text.includes('🟡')) return CheckCircle2;
  if (text.includes('🚨')) return AlertCircle;
  return Clock;
}

export function AIRecommendation() {
  const { result, runDemo } = useOptimizerStore();
  const [accepted, setAccepted] = useState(false);

  // Trigger demo allocation if no result is available
  useEffect(() => {
    if (!result) {
      runDemo();
    }
  }, [result, runDemo]);

  // Retrieve assignment for Ananya Sharma (v1)
  const myAssignment = result?.assignments.find((a) => a.volunteerId === 'v1');

  const handleAccept = () => {
    setAccepted(true);
    toast.success('Assignment accepted! Route details sent to navigation systems.');
  };

  if (!myAssignment) {
    return (
      <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <Brain className="w-10 h-10 text-slate-700 mb-3" />
        <p className="text-sm text-slate-400">AI Assignment Engine is syncing...</p>
        <button onClick={runDemo} className="mt-4 bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs px-3 py-1.5 rounded-lg hover:bg-violet-600/30 transition-all">
          Trigger Match
        </button>
      </div>
    );
  }

  // Calculate Match Score based on total Cost
  const matchScore = Math.max(10, Math.round((10 - myAssignment.costBreakdown.totalCost) * 10));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#080f1d] border border-white/[0.07] rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-amber-500/[0.04]">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <Brain className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">AI Recommendation Engine</h2>
          <p className="text-sm text-slate-500">Optimized matching via Kuhn–Munkres Algorithm</p>
        </div>
        <span className="ml-auto text-xs font-bold px-2 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg uppercase tracking-wide">Top Match</span>
      </div>

      <div className="p-5">
        {/* Recommended mission */}
        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-amber-500 font-semibold uppercase tracking-widest mb-1">Globally Optimized Assignment</div>
              <div className="text-xl font-semibold text-white mb-1">{myAssignment.requestTitle}</div>
              <div className="flex items-center gap-2 text-base text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                Distance: {myAssignment.costBreakdown.distanceKm.toFixed(1)} km
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-bold text-green-400">{matchScore}%</div>
              <div className="text-xs text-slate-500 font-medium">match score</div>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base text-slate-400 font-medium">Assignment Cost Efficiency</span>
            <span className="text-sm text-slate-500 font-semibold text-green-400">Optimal allocation</span>
          </div>
          <ConfidenceBar value={matchScore} />
        </div>

        {/* Reasons */}
        <div className="mb-5">
          <div className="text-base font-medium text-slate-400 mb-3">AI Explainability Breakdown:</div>
          <div className="space-y-2.5">
            {myAssignment.explanation.map((reason, i) => {
              const Icon = getIconForReason(reason);
              // Strip out the leading emoji character from display if it's there
              const textClean = reason.replace(/^[📍✅🟢🟡🚨📊⚠️]\s*/, '');

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-base text-slate-300 leading-snug">
                    {textClean}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleAccept}
          disabled={accepted}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-lg font-medium transition-all shadow-lg ${
            accepted 
              ? 'bg-green-500/15 border border-green-500/30 text-green-400 shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          {accepted ? 'Mission Accepted' : 'Accept This Assignment'}
          {!accepted && <ChevronRight className="w-4 h-4 ml-1" />}
        </motion.button>
      </div>
    </motion.div>
  );
}
