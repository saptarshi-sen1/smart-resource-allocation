'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/services/firebase/config';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Shield, Mail, Lock, User, Building2, Eye, EyeOff,
  Zap, Map, FileText, ArrowRight, Users, Globe, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

type AuthMode = 'login' | 'register';
type UserRole = 'volunteer' | 'ngo';

// Stable particle positions — avoids SSR/client hydration mismatch caused by Math.random()
const PARTICLES = [
  { left: 14.2, top: 22.5, duration: 5.1, delay: 0.3 },
  { left: 73.8, top: 61.4, duration: 4.2, delay: 1.2 },
  { left: 88.1, top: 10.7, duration: 6.5, delay: 0.8 },
  { left: 31.5, top: 83.2, duration: 4.8, delay: 2.1 },
  { left: 55.9, top: 44.6, duration: 7.2, delay: 0.5 },
  { left: 6.3,  top: 71.9, duration: 5.6, delay: 3.3 },
  { left: 42.7, top: 15.3, duration: 4.4, delay: 1.7 },
  { left: 66.2, top: 92.1, duration: 6.1, delay: 4.0 },
  { left: 22.9, top: 36.8, duration: 5.3, delay: 0.2 },
  { left: 91.4, top: 58.3, duration: 4.9, delay: 2.8 },
  { left: 48.6, top: 7.4,  duration: 7.0, delay: 1.4 },
  { left: 3.1,  top: 47.9, duration: 5.8, delay: 5.0 },
  { left: 79.3, top: 29.5, duration: 4.6, delay: 0.9 },
  { left: 34.0, top: 67.2, duration: 6.3, delay: 3.6 },
  { left: 61.7, top: 51.0, duration: 5.0, delay: 2.5 },
];

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['volunteer', 'ngo']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length >= 4 ? 1 : 0;
  const labels = ['', 'Weak', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  if (!password) return null;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-white/10'}`} />
        ))}
      </div>
      <span className="text-xs text-slate-400">{labels[strength]}</span>
    </div>
  );
}

function RadarPulse({ delay, size }: { delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-blue-500/15"
      style={{ width: size, height: size, top: '50%', left: '50%', translateX: '-50%', translateY: '-50%' }}
      animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

function FloatingBadge({
  children, className, delay,
}: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0.8 }}
      className={`absolute bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl hidden xl:block ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('volunteer');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'volunteer' },
  });

  const watchedPassword = registerForm.watch('password', '');

  const redirectByRole = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      const role = snap.data()?.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'ngo') router.push('/ngo');
      else router.push('/volunteer');
    } catch (e) {
      console.warn("Firestore not initialized or offline, defaulting to volunteer dashboard:", e);
      router.push('/volunteer');
    }
  };

  const handleAuthError = (e: unknown, defaultMessage: string) => {
    const err = e as { code?: string; message?: string };
    const msg = err.message || '';
    if (err.code === 'auth/configuration-not-found' || msg.includes('CONFIGURATION_NOT_FOUND') || msg.includes('400')) {
      toast.error('Firebase Auth is not enabled for project "smartconnect-8a22d". Please enable Email/Password & Google sign-in in your Firebase Console.', { duration: 6000 });
    } else if (err.code === 'auth/invalid-credential') {
      toast.error('Invalid email or password');
    } else if (err.code === 'auth/email-already-in-use') {
      toast.error('Email already registered.');
    } else {
      toast.error(defaultMessage);
    }
  };

  const onLogin = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success('Welcome back!');
      await redirectByRole(cred.user.uid);
    } catch (e) {
      handleAuthError(e, 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString(),
      });
      toast.success('Account created! Welcome to CrisisConnect.');
      router.push(data.role === 'ngo' ? '/ngo' : '/volunteer');
    } catch (e) {
      handleAuthError(e, 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      // Check if user already exists
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (!snap.exists()) {
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: cred.user.displayName,
          email: cred.user.email,
          role: 'volunteer',
          createdAt: new Date().toISOString(),
        });
      }
      toast.success('Welcome!');
      await redirectByRole(cred.user.uid);
    } catch (e) {
      handleAuthError(e, 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async () => {
    if (!forgotEmail) return;
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success('Password reset email sent!');
      setShowForgot(false);
    } catch {
      toast.error('Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#06101e] bg-tech-grid flex overflow-hidden relative">
      {/* Technical Grid Telemetry */}
      <div className="absolute top-4 left-6 hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        AUTH GATEWAY | GRID 20.2961° N, 85.8245° E | SECURE PROTOCOL
      </div>

      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(59,130,246,0.1),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Floating particles — stable positions to prevent hydration mismatch */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/20"
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
            animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }}
          />
        ))}
        {/* Radar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <RadarPulse delay={0} size={400} />
          <RadarPulse delay={1.5} size={600} />
          <RadarPulse delay={3} size={800} />
        </div>
      </div>

      {/* ─── Left Panel ─── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="relative hidden lg:flex flex-col justify-between w-[45%] p-12 xl:p-16"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            CrisisConnect
          </span>
        </Link>

        {/* Main Headline */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4"
          >
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Disaster Response
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-slate-400 text-base mb-8 leading-relaxed max-w-sm"
          >
            Connecting NGOs, Volunteers, and Emergency Teams in Real Time.
            CrisisConnect intelligently matches volunteers and digitizes field reports.
          </motion.p>

          {/* Feature List */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-10"
          >
            {[
              { icon: Zap, text: 'AI Volunteer Matching', color: 'text-blue-400' },
              { icon: FileText, text: 'OCR Document Processing', color: 'text-violet-400' },
              { icon: Lock, text: 'Secure Resource Allocation', color: 'text-green-400' },
              { icon: Map, text: 'Live Disaster Maps', color: 'text-orange-400' },
              { icon: Shield, text: 'Firebase Protected Authentication', color: 'text-cyan-400' },
            ].map((item, i) => (
              <motion.li
                key={item.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className={`w-5 h-5 rounded-full bg-current/10 flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-3 h-3" />
                </div>
                <span className="text-sm text-slate-300">{item.text}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: '15K+', label: 'Volunteers' },
              { val: '250+', label: 'NGOs' },
              { val: '500K+', label: 'People Helped' },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-white">{s.val}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap gap-2">
          {['Firebase Secured', '256-bit Auth', 'Encrypted Data'].map((t) => (
            <span key={t} className="text-xs bg-white/[0.05] border border-white/10 rounded-full px-3 py-1 text-slate-400">
              🔒 {t}
            </span>
          ))}
        </div>

        {/* Floating Status Badges */}
        <FloatingBadge className="top-24 right-4" delay={0.8}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Emergency Alert</span>
          </div>
          <div className="text-slate-400 mt-0.5">Flood — Odisha</div>
        </FloatingBadge>
        <FloatingBadge className="bottom-32 right-0" delay={1.2}>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-slate-300">Volunteers Online</span>
          </div>
          <div className="text-blue-400 font-bold text-sm mt-0.5">1,254</div>
        </FloatingBadge>
      </motion.div>

      {/* ─── Right Panel — Auth Card ─── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">

            {/* Logo (mobile only) */}
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CrisisConnect</span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Secure access to your disaster response dashboard
            </p>

            {/* Segmented Tab Switch */}
            <div className="relative flex bg-white/[0.05] border border-white/[0.08] rounded-xl p-1 mb-6">
              <motion.div
                layoutId="tab-bg"
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg"
                animate={{ x: mode === 'login' ? 0 : 'calc(100% + 4px)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === m ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── Login Form ── */}
              {mode === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        {...loginForm.register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-400">Password</label>
                      <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        {...loginForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Sign In <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* ── Register Form ── */}
              {mode === 'register' && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4"
                >
                  {/* Role Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">I am a</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['volunteer', 'ngo'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => { setSelectedRole(r); registerForm.setValue('role', r); }}
                          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                            selectedRole === r
                              ? 'bg-blue-500/15 border-blue-500/50 text-blue-400'
                              : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20'
                          }`}
                        >
                          {r === 'volunteer' ? <Users className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                          {r === 'volunteer' ? 'Volunteer' : 'NGO / Org'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        {...registerForm.register('name')}
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        {...registerForm.register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        {...registerForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={watchedPassword} />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        {...registerForm.register('confirmPassword')}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-xs text-slate-500">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Google Sign In */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={onGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </motion.button>

            {/* Trust Indicators */}
            <div className="flex justify-center gap-4 mt-5">
              {['Firebase Secured', '256-bit Auth', 'Encrypted'].map((t) => (
                <span key={t} className="text-[10px] text-slate-600">🔒 {t}</span>
              ))}
            </div>
          </div>

          {/* Language switcher below card */}
          <div className="flex justify-center gap-4 mt-4">
            {['English', 'हिन्दी', 'বাংলা'].map((lang) => (
              <button key={lang} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                <Globe className="w-3 h-3" />{lang}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Forgot Password Modal ── */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b1325] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-semibold">Reset Password</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">Enter your email and we&apos;ll send a reset link.</p>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowForgot(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-slate-400 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={onForgotPassword} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
                  Send Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
