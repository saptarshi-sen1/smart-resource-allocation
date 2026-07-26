'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudRain,
  Wind,
  Droplets,
  Eye,
  AlertTriangle,
  MessageSquare,
  Radio,
  MapPin,
  CheckSquare,
  Bell,
  UserCheck,
} from 'lucide-react';

// Types
interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
}

interface ActivityItem {
  id: string;
  type: 'assignment' | 'supply' | 'request' | 'message';
  text: string;
  time: string;
  read: boolean;
}

interface Message {
  id: string;
  from: string;
  org: string;
  preview: string;
  time: string;
  initials: string;
}

const ALERTS: Alert[] = [
  { id: 'a1', severity: 'critical', message: 'Flash flood warning — Patna North. Avoid NH-30 near riverbank.', time: '5 min ago' },
  { id: 'a2', severity: 'warning', message: 'Heavy rainfall expected — next 6 hours. Carry waterproof gear.', time: '22 min ago' },
  { id: 'a3', severity: 'info', message: 'Medical supplies arriving at Camp A — 4:30 PM.', time: '1 hr ago' },
];

const ACTIVITY: ActivityItem[] = [
  { id: 'ac1', type: 'assignment', text: 'Bihar Flood Response Org. assigned you to Flood Relief.', time: '2 min ago', read: false },
  { id: 'ac2', type: 'supply', text: 'Medical supplies delivered to Guwahati Relief Camp.', time: '8 min ago', read: false },
  { id: 'ac3', type: 'request', text: 'New critical request matched nearby — Patna North Zone.', time: 'Just now', read: false },
  { id: 'ac4', type: 'message', text: 'NGO coordinator sent briefing document.', time: '35 min ago', read: true },
  { id: 'ac5', type: 'assignment', text: 'Assignment #32 marked complete by supervisor.', time: '2 hrs ago', read: true },
];

const MESSAGES: Message[] = [
  {
    id: 'msg1',
    from: 'Rahul Sharma',
    org: 'Bihar Flood Response',
    preview: 'Please report to Gate 2, bring your ID and medical kit.',
    time: '4 min ago',
    initials: 'RS',
  },
  {
    id: 'msg2',
    from: 'Dr. Priya Nair',
    org: 'Assam Medical Aid',
    preview: 'Triage briefing at 5 PM. Be at Camp B entrance.',
    time: '1 hr ago',
    initials: 'PN',
  },
];

const SEVERITY_STYLES = {
  critical: 'border-l-red-500 bg-red-500/[0.05]',
  warning: 'border-l-amber-500 bg-amber-500/[0.04]',
  info: 'border-l-blue-500 bg-blue-500/[0.04]',
};
const SEVERITY_ICON_COLOR = {
  critical: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

type Panel = 'alerts' | 'activity' | 'messages';

export function RightPanel() {
  const [activePanel, setActivePanel] = useState<Panel>('activity');
  const unreadCount = ACTIVITY.filter((a) => !a.read).length;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Weather Widget */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm text-slate-500 uppercase tracking-wide mb-0.5">Field Weather</div>
            <div className="text-3xl font-bold text-white">28°C</div>
            <div className="flex items-center gap-1.5 text-base text-sky-400 mt-0.5">
              <CloudRain className="w-4 h-4" />
              Heavy Rain
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>Patna, Bihar</div>
            <div className="text-xs mt-0.5">Updated 2 min ago</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06]">
          {[
            { icon: Wind, label: 'Wind', value: '38 km/h' },
            { icon: Droplets, label: 'Humidity', value: '91%' },
            { icon: Eye, label: 'Visibility', value: '2 km' },
          ].map((w) => (
            <div key={w.label} className="text-center">
              <w.icon className="w-3.5 h-3.5 text-slate-500 mx-auto mb-1" />
              <div className="text-base font-semibold text-white">{w.value}</div>
              <div className="text-xs text-slate-600">{w.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feed Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="bg-[#080f1d] border border-white/[0.07] rounded-2xl flex-1 flex flex-col overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {([
            { id: 'activity' as Panel, label: 'Activity', icon: Bell, badge: unreadCount },
            { id: 'alerts' as Panel, label: 'Alerts', icon: Radio, badge: ALERTS.filter(a => a.severity === 'critical').length },
            { id: 'messages' as Panel, label: 'Messages', icon: MessageSquare, badge: MESSAGES.length },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all border-b-2 ${
                activePanel === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="text-[10px] font-bold bg-blue-500/25 text-blue-300 px-1.5 py-0.5 rounded-md">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <AnimatePresence mode="wait">
            {activePanel === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {ACTIVITY.map((item) => (
                  <div key={item.id} className={`flex gap-3 px-3 py-2.5 rounded-xl transition-colors ${item.read ? 'opacity-50' : 'bg-white/[0.025]'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${item.read ? 'bg-slate-600' : 'bg-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 leading-snug">{item.text}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activePanel === 'alerts' && (
              <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {ALERTS.map((alert) => (
                  <div key={alert.id} className={`border-l-2 pl-3 pr-2 py-2.5 rounded-r-xl ${SEVERITY_STYLES[alert.severity]}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${SEVERITY_ICON_COLOR[alert.severity]}`} />
                      <div>
                        <p className="text-sm text-slate-200 leading-snug">{alert.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activePanel === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {MESSAGES.map((msg) => (
                  <div key={msg.id} className="flex gap-3 px-3 py-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {msg.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white truncate">{msg.from}</span>
                        <span className="text-xs text-slate-600 flex-shrink-0">{msg.time}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{msg.org}</div>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{msg.preview}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-4"
      >
        <div className="text-sm text-slate-500 uppercase tracking-wide mb-3">Quick Actions</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: MapPin, label: 'Check In', color: 'text-green-400 hover:bg-green-500/10' },
            { icon: UserCheck, label: 'Mark Available', color: 'text-blue-400 hover:bg-blue-500/10' },
            { icon: CheckSquare, label: 'Log Hours', color: 'text-violet-400 hover:bg-violet-500/10' },
          ].map((action) => (
            <button
              key={action.label}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/[0.06] text-xs font-medium transition-all ${action.color}`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>

        {/* SOS */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mt-2 w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Emergency SOS
        </motion.button>
      </motion.div>
    </div>
  );
}
