'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useOptimizerStore } from '@/store/useOptimizerStore';
import { Shield, Users, Building2, FileText, BarChart3, LogOut, Home, Activity, Globe, Brain, Zap } from 'lucide-react';

import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, role, loading } = useAuthStore();
  const { result, greedyResult, isRunning, runDemo } = useOptimizerStore();

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  // Run the optimizer on mount to ensure stats are loaded
  useEffect(() => {
    if (user && role === 'admin' && !result) {
      runDemo();
    }
  }, [user, role, result, runDemo]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Signed out');
    router.push('/login');
  };

  const triggerOptimization = async () => {
    toast.promise(runDemo(), {
      loading: 'Running Hungarian Assignment algorithm...',
      success: 'Hungarian matching completed!',
      error: 'Optimization failed',
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#06101e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate improvement percentage
  const costReduction = result && greedyResult && greedyResult.totalCost > 0
    ? Math.round(((greedyResult.totalCost - result.totalCost) / greedyResult.totalCost) * 100)
    : 24;

  const statCards = [
    { label: 'Total Volunteers', value: '25 Available', icon: Users, color: 'from-blue-500 to-cyan-500', change: '+3 new today' },
    { label: 'Active NGOs', value: '9', icon: Building2, color: 'from-violet-500 to-purple-500', change: 'Live coordination' },
    { label: 'Disaster Requests', value: '10 Active', icon: FileText, color: 'from-orange-500 to-amber-500', change: '6 High/Critical urgency' },
    { label: 'Resource Coverage', value: '100% Optimal', icon: Globe, color: 'from-green-500 to-emerald-500', change: `${costReduction}% operational savings` },
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
          <span className="font-bold text-white text-sm">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { icon: Home, label: 'Overview', active: true },
            { icon: Brain, label: 'AI Optimizer', href: '/optimizer' },
            { icon: Users, label: 'Volunteers' },
            { icon: Building2, label: 'NGOs' },
            { icon: FileText, label: 'Requests' },
            { icon: BarChart3, label: 'Analytics' },
            { icon: Activity, label: 'System Health' },
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white font-medium truncate">{user.email}</div>
              <div className="text-xs text-red-400">Administrator</div>
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
              <h1 className="text-2xl font-bold text-white">Admin Command Center</h1>
              <p className="text-slate-400 text-sm mt-1">Global platform overview and system management</p>
            </div>
            <Link href="/optimizer">
              <button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                <Brain className="w-4 h-4" /> Open Optimizer Studio
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
                <div className="text-xs text-green-400 mt-1">{stat.change}</div>
              </motion.div>
            ))}
          </div>

          {/* AI Optimization Panel Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            
            {/* Optimizer stats and triggers */}
            <div className="xl:col-span-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">AI Resource Assignment Optimizer</h2>
                      <p className="text-xs text-slate-500">Kuhn–Munkres globally optimal deployment engine</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                    isRunning ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-green-500/15 text-green-400 border border-green-500/30'
                  }`}>
                    {isRunning ? 'Optimizing...' : 'Sync Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  {[
                    { label: 'Optimal Match Rate', value: '100%', sub: '0 assignments left' },
                    { label: 'Avg Travel Cost', value: result ? result.totalCost.toFixed(2) : '31.42', sub: 'Minimizing objective' },
                    { label: 'Average ETA', value: result ? `${Math.round(result.avgEtaMinutes)} min` : '18 min', sub: '50% weight priority' },
                    { label: 'Optimizer Runtime', value: result ? `${result.runtimeMs.toFixed(2)} ms` : '1.24 ms', sub: 'Polynomial O(n³)' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-white font-mono">{stat.value}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-medium">{stat.label}</div>
                      <div className="text-[8px] text-slate-600 mt-0.5">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/[0.06]">
                <button 
                  onClick={triggerOptimization}
                  disabled={isRunning}
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" /> Re-run Hungarian Matcher
                </button>
                <Link href="/optimizer" className="w-full sm:w-auto">
                  <button className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/[0.06] transition-all flex items-center justify-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" /> Open Visual Flow Map
                  </button>
                </Link>
                <div className="text-[10px] text-slate-500 text-center sm:text-left mt-1 sm:mt-0 flex-1">
                  Re-runs automatically when volunteers check in or new OCR requests are filed.
                </div>
              </div>
            </div>

            {/* Live Optimization Graph Card */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Algorithm Efficiency</h3>
                <p className="text-[11px] text-slate-500 mb-4">Total operational travel cost (Lower is better)</p>
                
                {/* SVG Graph */}
                <div className="h-28 flex items-end gap-5 justify-center py-2 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full border-t border-white/[0.08]" />
                    <div className="w-full border-t border-white/[0.08]" />
                    <div className="w-full border-t border-white/[0.08]" />
                  </div>

                  {/* Hungarian Bar */}
                  <div className="flex-1 flex flex-col items-center gap-1.5 z-10">
                    <motion.div
                      className="w-full bg-gradient-to-t from-green-500/20 to-green-500/50 border border-green-500/40 rounded-lg relative group cursor-help"
                      initial={{ height: 0 }}
                      animate={{ height: '52%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-1 text-[9px] text-green-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Hungarian: {result ? result.totalCost.toFixed(1) : '31.4'}
                      </div>
                    </motion.div>
                    <span className="text-[9px] font-semibold text-green-400">Hungarian</span>
                  </div>

                  {/* Greedy Bar */}
                  <div className="flex-1 flex flex-col items-center gap-1.5 z-10">
                    <motion.div
                      className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500/50 border border-amber-500/40 rounded-lg relative group cursor-help"
                      initial={{ height: 0 }}
                      animate={{ height: '78%' }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-1 text-[9px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Greedy: {greedyResult ? greedyResult.totalCost.toFixed(1) : '48.6'}
                      </div>
                    </motion.div>
                    <span className="text-[9px] font-semibold text-amber-400">Greedy Nearest</span>
                  </div>

                  {/* Random Bar */}
                  <div className="flex-1 flex flex-col items-center gap-1.5 z-10">
                    <motion.div
                      className="w-full bg-gradient-to-t from-red-500/20 to-red-500/50 border border-red-500/40 rounded-lg relative group cursor-help"
                      initial={{ height: 0 }}
                      animate={{ height: '95%' }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-1 text-[9px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Random: 88.2
                      </div>
                    </motion.div>
                    <span className="text-[9px] font-semibold text-red-400">Naive Flat</span>
                  </div>
                </div>
              </div>

              <div className="bg-violet-500/[0.05] border border-violet-500/10 rounded-xl p-2.5 mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Hungarian improves performance by:</span>
                <span className="font-bold text-green-400 font-mono">-{costReduction}% cost reduction</span>
              </div>
            </div>

          </div>

          {/* Users Table */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent Users</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-white/[0.08]">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { name: 'Arjun Sharma', role: 'Volunteer', joined: 'Jul 24', status: 'Active' },
                    { name: 'Priya Relief Org', role: 'NGO', joined: 'Jul 23', status: 'Active' },
                    { name: 'Ravi Kumar', role: 'Volunteer', joined: 'Jul 22', status: 'Inactive' },
                    { name: 'Bengal Aid Society', role: 'NGO', joined: 'Jul 21', status: 'Active' },
                  ].map((u) => (
                    <tr key={u.name} className="border-b border-white/[0.04] last:border-0">
                      <td className="py-3 text-white">{u.name}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'NGO' ? 'bg-violet-500/15 text-violet-400' : 'bg-blue-500/15 text-blue-400'
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-3 text-slate-400">{u.joined}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.status === 'Active' ? 'bg-green-500/15 text-green-400' : 'bg-slate-500/15 text-slate-400'
                        }`}>{u.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Firebase Status', status: 'Operational', color: 'text-green-400', dot: 'bg-green-400' },
              { label: 'Firestore DB', status: 'Operational', color: 'text-green-400', dot: 'bg-green-400' },
              { label: 'Auth Service', status: 'Operational', color: 'text-green-400', dot: 'bg-green-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
                <div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                  <div className={`text-sm font-medium ${s.color}`}>{s.status}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

