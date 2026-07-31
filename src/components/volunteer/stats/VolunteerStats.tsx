'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Users, Zap, Award, TrendingUp } from 'lucide-react';

interface Stat {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  accent: string;
  sparkline?: number[];
}

const STATS: Stat[] = [
  {
    icon: Clock,
    label: 'Hours Volunteered',
    value: '247',
    sub: '+18 this month',
    accent: 'text-blue-400',
    sparkline: [20, 35, 28, 45, 38, 52, 48, 60, 55, 70, 65, 80],
  },
  {
    icon: CheckCircle2,
    label: 'Assignments',
    value: '34',
    sub: '3 this week',
    accent: 'text-green-400',
  },
  {
    icon: Users,
    label: 'People Assisted',
    value: '1,840',
    sub: 'Total impact',
    accent: 'text-violet-400',
  },
  {
    icon: Zap,
    label: 'Avg. Response',
    value: '4.2 min',
    sub: '↓ 0.8 min faster',
    accent: 'text-amber-400',
  },
  {
    icon: Award,
    label: 'Certifications',
    value: '6',
    sub: 'First Aid · CPR · more',
    accent: 'text-cyan-400',
  },
  {
    icon: TrendingUp,
    label: 'Current Rank',
    value: '#28',
    sub: 'District leaderboard',
    accent: 'text-orange-400',
  },
];

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 24;
  const w = 60;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="opacity-50">
      <polyline
        points={pts}
        fill="none"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VolunteerStats() {
  return (
    <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-5">
      <h2 className="text-2xl font-semibold text-white mb-5">Your Impact</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.accent}`} />
              </div>
              {stat.sparkline && <MiniSparkline data={stat.sparkline} />}
            </div>
            <div className={`text-2xl font-bold ${stat.accent} tabular-nums leading-none mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-slate-400 font-medium leading-tight mb-1">{stat.label}</div>
            <div className="text-xs text-slate-600">{stat.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
