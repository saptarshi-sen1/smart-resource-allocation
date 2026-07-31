'use client';

import { motion } from 'framer-motion';
import { Play, RefreshCw, Zap, Users, FileText } from 'lucide-react';
import { useOptimizerStore } from '@/store/useOptimizerStore';
import { DEMO_VOLUNTEERS, DEMO_REQUESTS } from '@/services/demoDataService';

export function DemoControls() {
  const { isRunning, lastRunAt, runDemo, reset, result } = useOptimizerStore();


  const handleRunDemo = async () => {
    await runDemo();
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
          <Zap className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Demo Controls</h3>
          <p className="text-xs text-slate-500">Hackathon demonstration scenario</p>
        </div>
      </div>

      {/* Demo stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-2.5">
          <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div>
            <div className="text-lg font-bold text-white">{DEMO_VOLUNTEERS.length}</div>
            <div className="text-[10px] text-slate-500">Volunteers (8 cities)</div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-lg font-bold text-white">{DEMO_REQUESTS.length}</div>
            <div className="text-[10px] text-slate-500">Requests (mixed severity)</div>
          </div>
        </div>
      </div>

      {/* Severity breakdown */}
      <div className="mb-4 p-3 bg-white/[0.02] rounded-xl">
        <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Request Severity Mix</div>
        <div className="flex items-center gap-2">
          {[
            { label: 'Critical', count: DEMO_REQUESTS.filter(r => r.severity === 'critical').length, color: 'bg-red-500' },
            { label: 'High', count: DEMO_REQUESTS.filter(r => r.severity === 'high').length, color: 'bg-amber-500' },
            { label: 'Medium', count: DEMO_REQUESTS.filter(r => r.severity === 'medium').length, color: 'bg-yellow-500' },
            { label: 'Low', count: DEMO_REQUESTS.filter(r => r.severity === 'low').length, color: 'bg-slate-500' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              {s.label}: {s.count}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleRunDemo}
          disabled={isRunning}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isRunning
              ? 'rgba(139,92,246,0.2)'
              : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: isRunning ? 'none' : '0 4px 20px rgba(139,92,246,0.3)',
          }}
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running Hungarian Algorithm…
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Demo Optimization
            </>
          )}
        </motion.button>

        {result && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-slate-400 border border-white/[0.07] hover:border-white/[0.15] hover:text-white transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </motion.button>
        )}
      </div>

      {/* Last run info */}
      {lastRunAt && (
        <div className="mt-3 text-center text-[10px] text-slate-600">
          Last run: {lastRunAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
