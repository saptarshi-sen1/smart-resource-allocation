'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  ClipboardList,
  Map,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Wifi,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type NavItem = {
  icon: React.ElementType;
  label: string;
  badge?: number;
  id: string;
};

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: AlertTriangle, label: 'Active Requests', badge: 3, id: 'requests' },
  { icon: MapPin, label: 'Nearby Disasters', badge: 7, id: 'nearby' },
  { icon: ClipboardList, label: 'My Assignments', id: 'assignments' },
  { icon: Map, label: 'Live Map', id: 'map' },
  { icon: MessageSquare, label: 'Messages', badge: 2, id: 'messages' },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

interface VolunteerSidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

export function VolunteerSidebar({ activeId, onNavigate }: VolunteerSidebarProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Volunteer';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut(auth);
    toast.success('Signed out safely');
    router.push('/login');
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-[300px] flex-shrink-0 bg-[#060f1c] border-r border-white/[0.06] flex flex-col h-screen sticky top-0 overflow-hidden"
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

      <div className="relative flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-[15px] leading-tight tracking-tight">CrisisConnect</div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Response Platform</div>
            </div>
          </div>

          {/* System status */}
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-green-500/[0.08] border border-green-500/20 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-[11px] text-green-400 font-medium">All systems operational</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item, i) => {
            const isActive = activeId === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-500/[0.12] text-blue-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {/* Active left indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActive"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-400 rounded-r-full"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                    />
                  )}
                </AnimatePresence>

                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="text-[17px] font-medium flex-1 text-left leading-none">{item.label}</span>

                {item.badge !== undefined && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center ${
                    isActive ? 'bg-blue-500/25 text-blue-300' : 'bg-white/[0.08] text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {!isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-3 pb-4 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[13px] font-bold text-white">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#060f1c]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-white font-semibold truncate">{displayName}</div>
              <div className="text-[11px] text-slate-500">Medical Response · Lvl 3</div>
            </div>
          </div>

          <motion.button
            onClick={handleLogout}
            disabled={isLoggingOut}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-all duration-200 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Signing out…' : 'Sign Out'}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
