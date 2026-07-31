'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolunteerSidebar } from './sidebar/VolunteerSidebar';
import { WelcomeHeader } from './header/WelcomeHeader';
import { StatusCard } from './ops/StatusCard';
import { MissionFeed } from './ops/MissionFeed';
import { DisasterMapPanel } from './map/DisasterMapPanel';
import { AIRecommendation } from './ai/AIRecommendation';
import { AssignmentTimeline } from './ops/AssignmentTimeline';
import { NearbyResources } from './resources/NearbyResources';
import { VolunteerStats } from './stats/VolunteerStats';
import { RightPanel } from './panel/RightPanel';
import { Menu, X } from 'lucide-react';

// --- Inline stub views for simple sections ---

function MessagesView() {
  const threads = [
    { initials: 'RS', from: 'Rahul Sharma', org: 'Bihar Flood Response', message: 'Please report to Gate 2, bring your ID and medical kit.', time: '4 min ago', unread: true },
    { initials: 'PN', from: 'Dr. Priya Nair', org: 'Assam Medical Aid Trust', message: 'Triage briefing at 5 PM. Be at Camp B entrance.', time: '1 hr ago', unread: true },
    { initials: 'CA', from: 'Coastal Aid Network', org: 'NGO Coordinator', message: 'Assignment cancelled due to updated evacuation route.', time: '2 hrs ago', unread: false },
    { initials: 'ND', from: 'NDRF Control', org: 'National Disaster Response', message: 'Your deployment to Sunderban zone is confirmed.', time: 'Yesterday', unread: false },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-4xl font-bold text-white mb-6">Messages</h1>
      {threads.map((t, i) => (
        <motion.div
          key={t.from}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className={`flex gap-4 p-5 rounded-2xl border cursor-pointer hover:-translate-y-0.5 transition-all duration-200 ${
            t.unread
              ? 'bg-blue-500/[0.05] border-blue-500/20'
              : 'bg-white/[0.03] border-white/[0.07] opacity-70'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {t.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div>
                <span className="text-lg font-semibold text-white">{t.from}</span>
                <span className="text-base text-slate-500 ml-2">· {t.org}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {t.unread && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                <span className="text-sm text-slate-600">{t.time}</span>
              </div>
            </div>
            <p className="text-base text-slate-400 truncate">{t.message}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function NotificationsView() {
  const notes = [
    { color: 'bg-red-500', badge: 'CRITICAL', text: 'Flash flood warning — Patna North. Avoid NH-30 near riverbank.', time: '5 min ago' },
    { color: 'bg-blue-500', badge: 'ASSIGNMENT', text: 'Bihar Flood Response Org. assigned you to Flood Relief operation.', time: '12 min ago' },
    { color: 'bg-amber-500', badge: 'WEATHER', text: 'Heavy rainfall expected over next 6 hours. Carry waterproof gear.', time: '22 min ago' },
    { color: 'bg-green-500', badge: 'UPDATE', text: 'Medical supplies have been delivered to Guwahati Relief Camp.', time: '40 min ago' },
    { color: 'bg-violet-500', badge: 'MATCH', text: 'New critical request matched to your skills — Patna North Zone.', time: '1 hr ago' },
    { color: 'bg-slate-500', badge: 'SYSTEM', text: 'Assignment #32 marked complete by supervisor.', time: '2 hrs ago' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-white">Notifications</h1>
        <button className="text-base text-blue-400 hover:text-blue-300 transition-colors">Mark all read</button>
      </div>
      {notes.map((n, i) => (
        <motion.div
          key={n.text}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex gap-4 p-5 bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:border-white/[0.12] transition-all"
        >
          <div className={`w-2 rounded-full flex-shrink-0 ${n.color}`} style={{ minHeight: 48 }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-white ${n.color}`}>{n.badge}</span>
              <span className="text-sm text-slate-600">{n.time}</span>
            </div>
            <p className="text-base text-slate-300 leading-snug">{n.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProfileView() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-6">My Profile</h1>
      <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white">V</div>
          <div>
            <h2 className="text-2xl font-bold text-white">Volunteer</h2>
            <p className="text-base text-slate-400">Medical Response Team · Level 3</p>
            <p className="text-sm text-slate-500 mt-1">Member since March 2025</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: 'Volunteer Account' },
            { label: 'Location', value: 'Kolkata, West Bengal' },
            { label: 'Phone', value: '+91 98765 43210' },
            { label: 'Emergency Contact', value: 'Not set' },
          ].map((f) => (
            <div key={f.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="text-sm text-slate-500 mb-1">{f.label}</div>
              <div className="text-base text-white font-medium">{f.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Certifications</h3>
        <div className="flex flex-wrap gap-2">
          {['First Aid', 'CPR Certified', 'Water Rescue', 'Triage', 'Crowd Management', 'Boat Operation'].map((c) => (
            <span key={c} className="px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 text-blue-300 text-base rounded-lg">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const toggles = [
    { label: 'Push Notifications', desc: 'Receive alerts for new assignments and requests', on: true },
    { label: 'Email Digest', desc: 'Daily summary of nearby disaster events', on: false },
    { label: 'Location Sharing', desc: 'Share your location with assigned NGOs', on: true },
    { label: 'Auto-Match', desc: 'Allow AI to auto-suggest matching assignments', on: true },
    { label: 'SMS Alerts', desc: 'Critical emergency alerts via SMS', on: true },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-6">Settings</h1>
      <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
        {toggles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center justify-between px-6 py-5"
          >
            <div>
              <div className="text-lg font-medium text-white">{t.label}</div>
              <div className="text-base text-slate-500 mt-0.5">{t.desc}</div>
            </div>
            <div className={`w-12 h-6 rounded-full flex-shrink-0 transition-colors ${t.on ? 'bg-blue-600' : 'bg-white/[0.1]'} flex items-center px-1`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${t.on ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── View Router ────────────────────────────────────────────────────────────

type NavId = string;

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: 'easeOut' as const },
};

function MainContent({ activeNav }: { activeNav: NavId }) {
  const renderView = () => {
    switch (activeNav) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <StatusCard />
            <VolunteerStats />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AIRecommendation />
              <AssignmentTimeline />
            </div>
          </div>
        );

      case 'requests':
        return (
          <div className="space-y-6">
            <MissionFeed />
          </div>
        );

      case 'nearby':
        return (
          <div className="space-y-6">
            <DisasterMapPanel />
            <NearbyResources />
          </div>
        );

      case 'assignments':
        return (
          <div className="space-y-6">
            <AssignmentTimeline />
          </div>
        );

      case 'map':
        return (
          <div className="space-y-6">
            <DisasterMapPanel />
          </div>
        );

      case 'messages':
        return <MessagesView />;

      case 'notifications':
        return <NotificationsView />;

      case 'profile':
        return <ProfileView />;

      case 'settings':
        return <SettingsView />;

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500 text-lg">Select a section from the sidebar</p>
          </div>
        );
    }
  };

  // Right panel only shows on dashboard, requests, nearby
  const showRightPanel = ['dashboard', 'requests', 'nearby', 'map'].includes(activeNav);

  return (
    <div className="flex flex-1 gap-0 min-w-0">
      {/* Center main */}
      <main className="flex-1 min-w-0 px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeNav} {...PAGE_TRANSITION}>
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Right Panel — only on relevant tabs */}
      {showRightPanel && (
        <aside className="hidden xl:flex flex-col w-[360px] flex-shrink-0 border-l border-white/[0.06] px-4 py-6 overflow-y-auto">
          <RightPanel />
        </aside>
      )}
    </div>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

export function VolunteerShell() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#06101e] flex overflow-hidden">
      {/* Topographic overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Cpath d='M0 400 Q200 380 400 400 Q600 420 800 400' stroke='rgba(59,130,246,0.035)' fill='none' stroke-width='1'/%3E%3Cpath d='M0 350 Q200 330 400 350 Q600 370 800 350' stroke='rgba(59,130,246,0.035)' fill='none' stroke-width='1'/%3E%3Cpath d='M0 300 Q200 280 400 300 Q600 320 800 300' stroke='rgba(59,130,246,0.025)' fill='none' stroke-width='1'/%3E%3Cpath d='M0 450 Q200 430 400 450 Q600 470 800 450' stroke='rgba(59,130,246,0.035)' fill='none' stroke-width='1'/%3E%3Cpath d='M0 500 Q200 480 400 500 Q600 520 800 500' stroke='rgba(59,130,246,0.025)' fill='none' stroke-width='1'/%3E%3Cpath d='M0 250 Q200 230 400 250 Q600 270 800 250' stroke='rgba(59,130,246,0.02)' fill='none' stroke-width='1'/%3E%3Cpath d='M0 550 Q200 530 400 550 Q600 570 800 550' stroke='rgba(59,130,246,0.02)' fill='none' stroke-width='1'/%3E%3Ccircle cx='200' cy='390' r='2' fill='rgba(96,165,250,0.15)'/%3E%3Ccircle cx='400' cy='410' r='1.5' fill='rgba(96,165,250,0.1)'/%3E%3Ccircle cx='600' cy='385' r='2' fill='rgba(96,165,250,0.12)'/%3E%3C/svg%3E")`,
          backgroundSize: '800px 800px',
        }}
      />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#06101e]/95 backdrop-blur-sm border-b border-white/[0.06]">
        <span className="text-white font-bold text-base">CrisisConnect</span>
        <button onClick={() => setMobileMenuOpen((v) => !v)} className="text-slate-400 hover:text-white transition-colors">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-40 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        hidden lg:flex
      `}>
        <VolunteerSidebar
          activeId={activeNav}
          onNavigate={(id) => {
            setActiveNav(id);
            setMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto">
        <WelcomeHeader />
        <MainContent activeNav={activeNav} />
      </div>
    </div>
  );
}
