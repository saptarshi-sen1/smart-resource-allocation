/**
 * CrisisConnect — Cost Matrix Builder
 * Constructs the N×M cost matrix used by the Hungarian Algorithm.
 * Each cell [i][j] = weighted cost of assigning volunteer i to request j.
 *
 * Cost = 0.5 × normalizedETA + 0.3 × severityPenalty + 0.2 × resourceMismatch
 */

import type { Volunteer, DisasterRequest, OptimizerConfig, CostBreakdown } from '@/types/optimizer';
import { calculateEtaMinutes, calculateDistanceKm, normalizeEta } from './eta';
import { getSeverityPenalty } from './severity';
import { calculateResourceMismatch } from './resourceMatcher';
import { PADDING_COST } from './config';

/**
 * Computes the full cost breakdown for a single volunteer–request pair.
 * All components are computed and returned for explainability purposes.
 */
export function computeCellCost(
  volunteer: Volunteer,
  request: DisasterRequest,
  config: OptimizerConfig,
): CostBreakdown {
  // ETA component
  const etaMinutes = calculateEtaMinutes(volunteer, request, config);
  const etaComponent = normalizeEta(etaMinutes, config.maxEtaMinutes);
  const distanceKm = calculateDistanceKm(volunteer, request);

  // Severity component
  const severityPenalty = getSeverityPenalty(request.severity);

  // Resource mismatch component
  const resourceMismatch = calculateResourceMismatch(
    volunteer.skills,
    request.requiredSkills,
  );

  // Weighted total
  const totalCost =
    config.weights.eta * etaComponent +
    config.weights.severity * severityPenalty +
    config.weights.resource * resourceMismatch;

  return {
    etaMinutes,
    etaComponent,
    severityPenalty,
    resourceMismatch,
    totalCost,
    distanceKm,
  };
}

/**
 * Builds the cost matrix for the Hungarian Algorithm.
 *
 * If volunteers.length !== requests.length, pads the smaller dimension
 * with PADDING_COST (999) rows/columns to create a square matrix.
 * The algorithm then ignores dummy assignments (cost = PADDING_COST).
 *
 * @returns Object containing the square cost matrix and full breakdowns
 */
export function buildCostMatrix(
  volunteers: Volunteer[],
  requests: DisasterRequest[],
  config: OptimizerConfig,
): {
  matrix: number[][];
  breakdowns: CostBreakdown[][];
  paddedVolunteers: number;
  paddedRequests: number;
} {
  const n = volunteers.length;
  const m = requests.length;
  const size = Math.max(n, m);

  // Initialize with padding cost
  const matrix: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(PADDING_COST),
  );
  const breakdowns: CostBreakdown[][] = Array.from({ length: size }, () =>
    Array(size).fill(null),
  );

  // Fill real cells
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const breakdown = computeCellCost(volunteers[i], requests[j], config);
      matrix[i][j] = breakdown.totalCost;
      breakdowns[i][j] = breakdown;
    }
  }

  return {
    matrix,
    breakdowns,
    paddedVolunteers: size - n,
    paddedRequests: size - m,
  };
}

/**
 * Returns a raw display matrix (only real rows/cols, not padded)
 * for the cost matrix heatmap visualization.
 */
export function buildDisplayMatrix(
  volunteers: Volunteer[],
  requests: DisasterRequest[],
  config: OptimizerConfig,
): number[][] {
  return volunteers.map((volunteer) =>
    requests.map((request) => {
      const breakdown = computeCellCost(volunteer, request, config);
      return Math.round(breakdown.totalCost * 100) / 100;
    }),
  );
}
