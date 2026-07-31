'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { OptimizerPage } from '@/components/optimizer/OptimizerPage';
import { Shield, ArrowLeft, Brain, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useOptimizerStore } from '@/store/useOptimizerStore';

export default function OptimizerAppPage() {
  const { runDemo } = useOptimizerStore();



  // Run initial demo on page mount so there is immediate data to look at
  useEffect(() => {
    runDemo();
  }, [runDemo]);

  return (
    <div className="min-h-screen bg-[#06101e] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white/[0.03] border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col p-4 flex-shrink-0">
        <div className="flex items-center justify-between lg:justify-start gap-2 px-2 mb-6 lg:mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">CrisisConnect</span>
          </div>
          <span className="text-[10px] bg-violet-500/10 border border-violet-500/30 text-violet-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            AI ENGINE
          </span>
        </div>

        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 flex-1">
          <Link href="/admin" className="w-full">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left text-slate-400 hover:text-white hover:bg-white/[0.05]">
              <Shield className="w-4 h-4" />
              Admin Command
            </button>
          </Link>
          <Link href="/ngo" className="w-full">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left text-slate-400 hover:text-white hover:bg-white/[0.05]">
              <Building2 className="w-4 h-4" />
              NGO Dashboard
            </button>
          </Link>
          <Link href="/volunteer" className="w-full">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left text-slate-400 hover:text-white hover:bg-white/[0.05]">
              <Users className="w-4 h-4" />
              Volunteer View
            </button>
          </Link>
          
          <div className="h-px bg-white/[0.08] my-3 hidden lg:block" />

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left bg-violet-500/15 text-violet-400 border border-violet-500/20">
            <Brain className="w-4 h-4" />
            AI Optimizer
          </button>
        </nav>

        <div className="border-t border-white/[0.08] pt-4 mt-auto hidden lg:block">
          <Link href="/admin">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <OptimizerPage />
        </motion.div>
      </div>
    </div>
  );
}
