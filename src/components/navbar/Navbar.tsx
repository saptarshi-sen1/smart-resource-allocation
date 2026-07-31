'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Shield, Menu, X, ChevronDown, Globe, User, LogOut, LayoutDashboard } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

const languages = ['English', 'हिन्दी', 'বাংলা'];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const dashboardHref =
    role === 'admin' ? '/admin' : role === 'ngo' ? '/ngo' : '/volunteer';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#06101e]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
            >
              <Shield className="w-4 h-4 text-white" />
            </motion.div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              CrisisConnect
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group ${
                  pathname === link.href
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLang}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-10 bg-[#0b1325] border border-white/10 rounded-xl py-1 min-w-[120px] shadow-2xl"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setCurrentLang(lang); setLangOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute right-0 top-10 bg-[#0b1325] border border-white/10 rounded-xl py-1 min-w-[180px] shadow-2xl"
                    >
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{user.email}</p>
                      </div>
                      <Link href={dashboardHref} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                Access Command Portal
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#06101e]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-400 hover:text-white py-2 border-b border-white/5"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href={dashboardHref} className="text-slate-400 hover:text-white py-2">Dashboard</Link>
                  <button onClick={handleLogout} className="text-red-400 text-left py-2">Sign out</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-3 rounded-xl font-medium mt-2">
                  Access Command Portal
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
