/**
 * CrisisConnect — Severity Penalty Module
 * Maps disaster severity levels to penalty scores used in the cost matrix.
 * Lower penalty = higher urgency = lower cost = preferred assignment.
 */

import type { Severity } from '@/types/optimizer';
import { SEVERITY_PENALTIES } from './config';

/**
 * Returns the severity penalty for a given severity level.
 * Critical = 0 (highest priority, minimizes cost)
 * Low      = 8 (lowest priority, increases cost)
 */
export function getSeverityPenalty(severity: Severity): number {
  return SEVERITY_PENALTIES[severity] ?? 5;
}

/**
 * Returns a human-readable urgency label for display.
 */
export function getSeverityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    critical: 'Critical — Immediate Response Required',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };
  return labels[severity] ?? 'Unknown Priority';
}

/**
 * Returns the Tailwind CSS color classes for a severity badge.
 */
export function getSeverityColor(severity: Severity): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const colors: Record<Severity, { bg: string; text: string; border: string; dot: string }> = {
    critical: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/30',
      dot: 'bg-red-500',
    },
    high: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
    },
    medium: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
      dot: 'bg-yellow-500',
    },
    low: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/20',
      dot: 'bg-slate-500',
    },
  };
  return colors[severity] ?? colors.medium;
}
