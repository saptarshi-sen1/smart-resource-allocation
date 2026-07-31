'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { VolunteerShell } from '@/components/volunteer/VolunteerShell';

export default function VolunteerPage() {
  const router = useRouter();
  const { user, role, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && (!user || role !== 'volunteer')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#06101e] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-slate-500 text-base">Loading operational data…</span>
      </div>
    );
  }

  return <VolunteerShell />;
}
