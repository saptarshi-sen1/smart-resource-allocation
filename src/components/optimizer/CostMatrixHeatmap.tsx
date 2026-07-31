'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface CostMatrixHeatmapProps {
  matrix: number[][];
  volunteerLabels: string[];
  requestLabels: string[];
  /** Highlight cells that are part of the optimal assignment */
  assignment?: number[]; // assignment[volunteerIdx] = requestIdx
}

function getColor(value: number, min: number, max: number): string {
  if (value >= 999) return 'rgba(255,255,255,0.03)'; // padded cell

  const range = max - min || 1;
  const normalized = (value - min) / range; // 0 = low cost (green), 1 = high cost (red)

  // Interpolate: green → amber → red
  if (normalized < 0.5) {
    const t = normalized * 2;
    const r = Math.round(34 + (245 - 34) * t);
    const g = Math.round(197 + (158 - 197) * t);
    const b = Math.round(94 + (11 - 94) * t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = (normalized - 0.5) * 2;
    const r = Math.round(245 + (239 - 245) * t);
    const g = Math.round(158 + (68 - 158) * t);
    const b = Math.round(11 + (68 - 11) * t);
    return `rgb(${r},${g},${b})`;
  }
}

export function CostMatrixHeatmap({
  matrix,
  volunteerLabels,
  requestLabels,
  assignment = [],
}: CostMatrixHeatmapProps) {
  const { min, max } = useMemo(() => {
    const real = matrix.flatMap((row) => row.filter((v) => v < 999));
    return {
      min: Math.min(...real),
      max: Math.max(...real),
    };
  }, [matrix]);

  if (matrix.length === 0 || requestLabels.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        Run optimization to see the cost matrix
      </div>
    );
  }

  const cellSize = Math.max(32, Math.min(56, Math.floor(480 / requestLabels.length)));

  return (
    <div className="overflow-auto">
      <div className="inline-block min-w-full">
        {/* Column headers (requests) */}
        <div className="flex" style={{ marginLeft: 88 }}>
          {requestLabels.map((label, j) => (
            <div
              key={j}
              className="text-[9px] text-slate-500 text-center leading-tight px-0.5"
              style={{ width: cellSize, flexShrink: 0 }}
            >
              <div className="truncate">{label}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {matrix.map((row, i) => (
          <div key={i} className="flex items-center mb-0.5">
            {/* Row header (volunteer) */}
            <div
              className="text-[9px] text-slate-500 text-right pr-2 truncate flex-shrink-0"
              style={{ width: 88 }}
            >
              {volunteerLabels[i] ?? `V${i + 1}`}
            </div>

            {/* Cells */}
            {row.slice(0, requestLabels.length).map((value, j) => {
              const isAssigned = assignment[i] === j;
              const bgColor = getColor(value, min, max);

              return (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: (i * requestLabels.length + j) * 0.005 }}
                  className="relative flex-shrink-0 flex items-center justify-center rounded-sm m-0.5"
                  style={{
                    width: cellSize - 4,
                    height: cellSize - 4,
                    backgroundColor: value >= 999 ? 'rgba(255,255,255,0.02)' : bgColor + '33',
                  }}
                  title={`Vol: ${volunteerLabels[i] ?? i} → Req: ${requestLabels[j] ?? j}\nCost: ${value.toFixed(2)}`}
                >
                  {/* Assigned cell ring */}
                  {isAssigned && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 rounded-sm border-2 border-white/70"
                    />
                  )}

                  <span
                    className="text-[8px] font-mono font-semibold"
                    style={{ color: value >= 999 ? '#334155' : bgColor }}
                  >
                    {value >= 999 ? '—' : value.toFixed(1)}
                  </span>

                  {/* Star for assigned optimal cell */}
                  {isAssigned && (
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                      <span className="text-[6px] text-[#06101e] font-black">★</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 ml-[88px]">
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 rounded-full" style={{
              background: 'linear-gradient(90deg, rgb(34,197,94), rgb(245,158,11), rgb(239,68,68))'
            }} />
          </div>
          <span className="text-[9px] text-slate-600">Low cost → High cost</span>
          <div className="flex items-center gap-1 ml-3">
            <div className="w-3 h-3 rounded-sm border border-white/70 bg-white/10" />
            <span className="text-[9px] text-slate-600">Optimal assignment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
