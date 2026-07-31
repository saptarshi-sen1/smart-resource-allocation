'use client';

import { motion } from 'framer-motion';
import {
  Cross,
  Utensils,
  Droplets,
  Home,
  ShieldCheck,
  Stethoscope,
  Navigation,
} from 'lucide-react';

type ResourceStatus = 'Open' | 'Full' | 'Closed' | 'Limited';

interface Resource {
  icon: React.ElementType;
  label: string;
  name: string;
  distance: string;
  status: ResourceStatus;
  capacity: number; // 0-100%
  detail: string;
}

const RESOURCES: Resource[] = [
  {
    icon: Cross,
    label: 'Hospital',
    name: 'PMCH Patna',
    distance: '3.1 km',
    status: 'Open',
    capacity: 72,
    detail: 'Emergency ward active',
  },
  {
    icon: Utensils,
    label: 'Food Distribution',
    name: 'Community Kitchen A',
    distance: '1.8 km',
    status: 'Open',
    capacity: 40,
    detail: 'Serving until 9 PM',
  },
  {
    icon: Droplets,
    label: 'Water Point',
    name: 'Zone 4 Water Tank',
    distance: '0.9 km',
    status: 'Open',
    capacity: 55,
    detail: 'Tanker arrives 6 PM',
  },
  {
    icon: Home,
    label: 'Shelter',
    name: 'School Relief Camp',
    distance: '2.2 km',
    status: 'Full',
    capacity: 98,
    detail: '340 / 350 capacity',
  },
  {
    icon: ShieldCheck,
    label: 'Police Station',
    name: 'Patna North PS',
    distance: '1.4 km',
    status: 'Open',
    capacity: 0,
    detail: 'Coordination point',
  },
  {
    icon: Stethoscope,
    label: 'Medical Unit',
    name: 'Mobile Clinic #3',
    distance: '4.7 km',
    status: 'Limited',
    capacity: 85,
    detail: 'Low supplies — 2 hrs',
  },
];

const STATUS_STYLES: Record<ResourceStatus, string> = {
  Open: 'bg-green-500/10 text-green-400 border-green-500/25',
  Full: 'bg-red-500/10 text-red-400 border-red-500/25',
  Closed: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
  Limited: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
};

const CAP_COLOR = (pct: number) =>
  pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';

export function NearbyResources() {
  return (
    <div className="bg-[#080f1d] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-white">Nearby Resources</h2>
        <span className="text-base text-slate-500">Within 5 km radius</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {RESOURCES.map((res, i) => (
          <motion.div
            key={res.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 group"
          >
            {/* Top */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                  <res.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">{res.label}</div>
                  <div className="text-base font-semibold text-white leading-tight">{res.name}</div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border flex-shrink-0 ${STATUS_STYLES[res.status]}`}>
                {res.status}
              </span>
            </div>

            {/* Detail */}
            <p className="text-sm text-slate-500 mb-3">{res.detail}</p>

            {/* Capacity bar (only if relevant) */}
            {res.capacity > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Capacity</span>
                  <span className={res.capacity >= 90 ? 'text-red-400' : res.capacity >= 70 ? 'text-amber-400' : 'text-green-400'}>
                    {res.capacity}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${CAP_COLOR(res.capacity)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${res.capacity}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {res.distance}
              </span>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Navigate →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
