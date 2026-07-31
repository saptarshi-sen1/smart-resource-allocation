'use client';

import { motion } from 'framer-motion';
import { useMemo, useRef, useEffect, useState } from 'react';
import type { Assignment, Volunteer, DisasterRequest } from '@/types/optimizer';

interface AssignmentFlowProps {
  volunteers: Volunteer[];
  requests: DisasterRequest[];
  assignments: Assignment[];
  isAnimating?: boolean;
}

interface NodePos {
  x: number;
  y: number;
  label: string;
  sub: string;
  id: string;
}

const VOLUNTEER_COLOR = '#3b82f6'; // blue
const REQUEST_COLOR_MAP: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#94a3b8',
};

export function AssignmentFlow({
  volunteers,
  requests,
  assignments,
}: AssignmentFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ w: 600, h: 400 });

  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      if (rect.width > 0) setSvgSize({ w: rect.width, h: rect.height });
    }
  }, []);

  const { w, h } = svgSize;
  const PADDING = 40;
  const volX = PADDING + 40;
  const reqX = w - PADDING - 40;

  // Limit to max 10 volunteers and 10 requests for visual clarity
  const displayVols = volunteers.slice(0, 10);
  const displayReqs = requests.slice(0, 10);

  const volNodes: NodePos[] = useMemo(() =>
    displayVols.map((v, i) => ({
      id: v.id,
      x: volX,
      y: PADDING + (i + 0.5) * ((h - PADDING * 2) / displayVols.length),
      label: v.name.split(' ')[0],
      sub: v.city ?? v.skills[0] ?? '',
    })),
    [displayVols, h, volX],
  );

  const reqNodes: NodePos[] = useMemo(() =>
    displayReqs.map((r, i) => ({
      id: r.id,
      x: reqX,
      y: PADDING + (i + 0.5) * ((h - PADDING * 2) / displayReqs.length),
      label: r.title.split('—')[0].trim().slice(0, 12),
      sub: r.severity,
    })),
    [displayReqs, h, reqX],
  );

  // Build assignment map
  const assignmentMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of assignments) map[a.volunteerId] = a.requestId;
    return map;
  }, [assignments]);

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full"
        style={{ minHeight: 300 }}
      >
        <defs>
          <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#22c55e" />
          </marker>
          <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background lines (unassigned / gray) */}
        {volNodes.map((vol) => {
          const assignedReqId = assignmentMap[vol.id];
          return reqNodes
            .filter((req) => req.id !== assignedReqId)
            .map((req) => (
              <line
                key={`${vol.id}-${req.id}-gray`}
                x1={vol.x}
                y1={vol.y}
                x2={req.x}
                y2={req.y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />
            ));
        })}

        {/* Assigned lines (animated, green) */}
        {volNodes.map((vol, vi) => {
          const assignedReqId = assignmentMap[vol.id];
          if (!assignedReqId) return null;
          const req = reqNodes.find((r) => r.id === assignedReqId);
          if (!req) return null;

          const lineLength = Math.hypot(req.x - vol.x, req.y - vol.y);


          return (
            <motion.line
              key={`${vol.id}-${assignedReqId}-assigned`}
              x1={vol.x}
              y1={vol.y}
              x2={req.x}
              y2={req.y}
              stroke="#22c55e"
              strokeWidth={1.5}
              strokeDasharray={lineLength}
              strokeDashoffset={lineLength}
              filter="url(#glow)"
              markerEnd="url(#arrowGreen)"
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.7, delay: vi * 0.08, ease: 'easeOut' }}
            />
          );
        })}

        {/* Volunteer nodes */}
        {volNodes.map((node, i) => {
          const isAssigned = !!assignmentMap[node.id];
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={12}
                fill={isAssigned ? VOLUNTEER_COLOR + '33' : 'rgba(255,255,255,0.05)'}
                stroke={isAssigned ? VOLUNTEER_COLOR : '#334155'}
                strokeWidth={1.5}
              />
              {isAssigned && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  fill="none"
                  stroke={VOLUNTEER_COLOR}
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              )}
              <text x={node.x - 42} y={node.y} textAnchor="end" dy="0.35em" fontSize={9} fill="#94a3b8">{node.label}</text>
              <text x={node.x - 42} y={node.y + 10} textAnchor="end" fontSize={7} fill="#475569">{node.sub.slice(0, 12)}</text>
            </motion.g>
          );
        })}

        {/* Request nodes */}
        {reqNodes.map((node, i) => {
          const sev = requests.find((r) => r.id === node.id)?.severity ?? 'medium';
          const col = REQUEST_COLOR_MAP[sev];
          const isAssigned = assignments.some((a) => a.requestId === node.id);

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <rect
                x={node.x - 12}
                y={node.y - 12}
                width={24}
                height={24}
                rx={4}
                fill={isAssigned ? col + '33' : 'rgba(255,255,255,0.05)'}
                stroke={isAssigned ? col : '#334155'}
                strokeWidth={1.5}
              />
              <text x={node.x + 20} y={node.y} dy="0.35em" fontSize={9} fill="#94a3b8">{node.label}</text>
              <text x={node.x + 20} y={node.y + 10} fontSize={7} fill="#475569" className="capitalize">{node.sub}</text>
            </motion.g>
          );
        })}

        {/* Labels */}
        <text x={volX} y={PADDING - 16} textAnchor="middle" fontSize={10} fill="#3b82f6" fontWeight="600">VOLUNTEERS</text>
        <text x={reqX} y={PADDING - 16} textAnchor="middle" fontSize={10} fill="#f59e0b" fontWeight="600">REQUESTS</text>
      </svg>
    </div>
  );
}
