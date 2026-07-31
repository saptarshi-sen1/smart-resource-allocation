'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useOptimizerStore } from '@/store/useOptimizerStore';
import { Shield, FileText, Map, BarChart3, LogOut, Home, PlusCircle, Users, Upload, Brain, ChevronDown, ChevronUp, Award, User, Clock, AlertTriangle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { formatEta } from '@/lib/optimization/eta';


export default function NGODashboard() {
  const router = useRouter();
  const { user, role, loading } = useAuthStore();
  const { result, runDemo } = useOptimizerStore();
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || role !== 'ngo')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  // Run initial demo on mount if not loaded
  useEffect(() => {
    if (user && role === 'ngo' && !result) {
      runDemo();
    }
  }, [user, role, result, runDemo]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Signed out');
    router.push('/login');
  };

  const toggleExpand = (id: string) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#06101e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback data if optimizer hasn't run
  const assignments = result?.assignments || [];
  const activeRequests = result ? result.matchedCount + result.unfilledCount : 10;
  const matchedCount = result ? result.matchedCount : 8;

  const statCards = [
    { label: 'Active Requests', value: `${activeRequests} Total`, icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'Volunteers Matched', value: `${matchedCount} Matched`, icon: Users, color: 'from-violet-500 to-purple-500' },
    { label: 'Global Cost score', value: result ? result.totalCost.toFixed(2) : '31.42', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
    { label: 'Coverage Efficiency', value: '98% Optimal', icon: Map, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[#06101e] flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white/[0.03] border-r border-white/[0.08] flex flex-col p-4 hidden lg:flex flex-shrink-0"
      >
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">CrisisConnect</span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { icon: Home, label: 'Dashboard', active: true },
            { icon: Brain, label: 'AI Optimizer', href: '/optimizer' },
            { icon: PlusCircle, label: 'Create Request' },
            { icon: Upload, label: 'OCR Upload' },
            { icon: Users, label: 'Volunteer Matching' },
            { icon: Map, label: 'Live Map' },
            { icon: BarChart3, label: 'Reports' },
          ].map((item) => {
            if (item.href) {
              return (
                <Link href={item.href} key={item.label} className="block w-full">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left text-slate-400 hover:text-white hover:bg-white/[0.05]">
                    <item.icon className="w-4 h-4 text-violet-400" />
                    {item.label}
                  </button>
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  item.active
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.08] pt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white font-medium truncate">{user.email}</div>
              <div className="text-xs text-slate-400">NGO Partner</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 p-6 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">NGO Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your requests, volunteers, and resource allocations</p>
            </div>
            <Link href="/optimizer">
              <button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                <Brain className="w-4 h-4 animate-pulse" /> Run Assignment Optimizer
              </button>
            </Link>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} p-0.5 mb-3`}>
                  <div className="w-full h-full rounded-[10px] bg-[#06101e]/70 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-400" /> Create Resource Request
              </h2>
              <p className="text-sm text-slate-400 mb-4">Submit a new volunteer or resource request. AI will match the best volunteers.</p>
              <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all">
                New Request
              </button>
            </div>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-violet-400" /> OCR Document Upload
              </h2>
              <p className="text-sm text-slate-400 mb-4">Scan physical field reports and auto-populate forms using Tesseract.js.</p>
              <button className="bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all">
                Upload Document
              </button>
            </div>
          </div>

          {/* Real-time assignments and ranking section */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-white">Live AI Resource Allocations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Globally optimized assignments mapped to current field requirements</p>
              </div>
              <span className="text-xs text-violet-400 font-semibold flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" /> Hungarian Algorithm Active
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                <AlertTriangle className="w-8 h-8 text-amber-500/60 mb-2" />
                <p className="text-sm">No assignments computed yet</p>
                <button onClick={runDemo} className="mt-4 bg-violet-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-violet-500 transition-colors">
                  Load Demo Data
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assign) => {
                  const isExpanded = expandedRequest === assign.requestId;

                  const matchScore = Math.max(10, Math.round((10 - assign.costBreakdown.totalCost) * 10));

                  return (
                    <div
                      key={assign.requestId}
                      className={`border rounded-xl transition-all duration-200 ${
                        isExpanded ? 'border-violet-500/30 bg-violet-500/[0.02]' : 'border-white/[0.06] bg-white/[0.02]'
                      }`}
                    >
                      {/* Summary Row */}
                      <div
                        onClick={() => toggleExpand(assign.requestId)}
                        className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                      >
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-white">{assign.requestTitle}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-medium text-blue-400">
                              <User className="w-3 h-3" /> Assigned: {assign.volunteerName}
                            </span>
                            <span className="text-slate-700">•</span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" /> ETA {formatEta(assign.costBreakdown.etaMinutes)}
                            </span>
                            <span className="text-slate-700">•</span>
                            <span className="text-slate-400">Dist: {assign.costBreakdown.distanceKm.toFixed(1)} km</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
                          <div className="text-right">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block ${
                              matchScore >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              matchScore >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {matchScore}% Match Score
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {/* Expandable Section: Ranked Candidates & Explainability */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-white/[0.06] overflow-hidden"
                          >
                            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Left side: AI explanation */}
                              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
                                  <Award className="w-3.5 h-3.5 text-violet-400" />
                                  Global Assignment Rationale
                                </h4>
                                <ul className="space-y-1.5">
                                  {assign.explanation.map((reason, idx) => (
                                    <li key={idx} className="text-xs text-slate-400 leading-snug">
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                                <div className="mt-3 text-[10px] text-slate-500 bg-white/[0.02] p-2 rounded border border-white/[0.04] leading-relaxed">
                                  💡 <strong>Note on global routing:</strong> The Hungarian Algorithm assigns volunteers globally to minimize total operational cost. This candidate is assigned as part of the globally optimal structure, rather than a simple localized nearest-neighbor calculation.
                                </div>
                              </div>

                              {/* Right side: Alternative Candidates */}
                              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                                <h4 className="text-xs font-semibold text-white mb-2">
                                  Alternative Candidates for this Request
                                </h4>
                                <div className="space-y-2">
                                  {[
                                    { name: 'Suresh Mondal', skill: 'Boat Operation', match: '89%', eta: '12 min', role: 'Available' },
                                    { name: 'Anita Joshi', skill: 'Food Distribution', match: '75%', eta: '25 min', role: 'Standby' },
                                    { name: 'Bhupen Gogoi', skill: 'Rescue', match: '60%', eta: '38 min', role: 'En Route' }
                                  ].map((alt, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white/[0.02] border border-white/[0.04] rounded hover:bg-white/[0.04] transition-all">
                                      <div>
                                        <div className="font-semibold text-slate-300 flex items-center gap-1">
                                          <span className="text-[10px] text-slate-500 font-mono">#{idx + 2}</span>
                                          {alt.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{alt.skill} • {alt.role}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-slate-400">{alt.match} Match</div>
                                        <div className="text-[10px] text-slate-500">ETA {alt.eta}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

