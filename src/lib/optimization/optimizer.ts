/**
 * CrisisConnect — Optimizer Orchestrator
 *
 * Main public API for the Assignment Optimizer.
 * Coordinates: cost matrix construction → Hungarian Algorithm → explanation generation.
 *
 * Usage:
 *   const result = await runOptimizer(volunteers, requests);
 */

import type {
  Volunteer,
  DisasterRequest,
  Assignment,
  OptimizationResult,
  OptimizerConfig,
  GreedyResult,
} from '@/types/optimizer';
import { OPTIMIZER_CONFIG, PADDING_COST } from './config';
import { buildCostMatrix, buildDisplayMatrix, computeCellCost } from './costMatrix';
import { hungarianAlgorithm, greedyAssignment, calculateTotalCost } from './hungarian';
import { formatEta } from './eta';
import { getSkillMatchDetails } from './resourceMatcher';
import { getSeverityLabel } from './severity';

// ─── Explainability ───────────────────────────────────────────────────────────

/**
 * Generates a human-readable explanation array for a single assignment.
 * Judges can read exactly why this volunteer was selected.
 */
function generateExplanation(
  volunteer: Volunteer,
  request: DisasterRequest,
  config: OptimizerConfig,
): string[] {
  const breakdown = computeCellCost(volunteer, request, config);
  const skillDetails = getSkillMatchDetails(volunteer.skills, request.requiredSkills);
  const reasons: string[] = [];

  // Distance / ETA
  const distStr = breakdown.distanceKm < 1
    ? `${Math.round(breakdown.distanceKm * 1000)} m`
    : `${breakdown.distanceKm.toFixed(1)} km`;
  reasons.push(`📍 ${distStr} away — ETA ${formatEta(breakdown.etaMinutes)}`);

  // Skill match
  if (skillDetails.matched.length > 0) {
    reasons.push(`✅ Skills matched: ${skillDetails.matched.join(', ')}`);
  }
  if (skillDetails.missing.length > 0) {
    reasons.push(`⚠️ Missing skills: ${skillDetails.missing.join(', ')}`);
  }
  if (request.requiredSkills.length === 0) {
    reasons.push('✅ No specific skills required for this request');
  }

  // Availability
  reasons.push(
    volunteer.available
      ? '🟢 Currently available and ready to deploy'
      : '🟡 On standby — available with short notice',
  );

  // Priority
  reasons.push(`🚨 ${getSeverityLabel(request.severity)}`);

  // Cost breakdown
  reasons.push(
    `📊 Total assignment cost: ${breakdown.totalCost.toFixed(2)} ` +
    `(ETA: ${breakdown.etaComponent.toFixed(1)}, ` +
    `Severity: ${breakdown.severityPenalty}, ` +
    `Skill match: ${breakdown.resourceMismatch.toFixed(1)})`,
  );

  return reasons;
}

// ─── Main Optimizer ───────────────────────────────────────────────────────────

/**
 * Runs the full Hungarian Algorithm optimization pipeline.
 *
 * Steps:
 * 1. Filter to available volunteers + active requests
 * 2. Build the cost matrix
 * 3. Run the Hungarian Algorithm
 * 4. Filter out dummy assignments (padded cells)
 * 5. Generate explanations for each assignment
 * 6. Compute summary statistics
 *
 * @param volunteers - All volunteers (will be filtered to available only)
 * @param requests   - All disaster requests (will be filtered to active only)
 * @param config     - Optional config override (defaults to OPTIMIZER_CONFIG)
 * @returns OptimizationResult with assignments, matrix, and statistics
 */
export function runOptimizer(
  volunteers: Volunteer[],
  requests: DisasterRequest[],
  config: OptimizerConfig = OPTIMIZER_CONFIG,
): OptimizationResult {
  const startMs = performance.now();

  // Filter to only available volunteers and active requests
  const availableVolunteers = volunteers.filter((v) => v.available && v.currentStatus !== 'offline');
  const activeRequests = requests.filter((r) => r.isActive);

  if (availableVolunteers.length === 0 || activeRequests.length === 0) {
    return {
      assignments: [],
      matrix: [],
      volunteerLabels: [],
      requestLabels: [],
      totalCost: 0,
      avgEtaMinutes: 0,
      runtimeMs: performance.now() - startMs,
      matchedCount: 0,
      unfilledCount: activeRequests.length,
    };
  }

  // Build cost matrix (padded to square)
  const { matrix, breakdowns } = buildCostMatrix(availableVolunteers, activeRequests, config);

  // Run Hungarian Algorithm
  const assignment = hungarianAlgorithm(matrix);

  // Build Assignment objects (ignoring padded dummy assignments)
  const assignments: Assignment[] = [];

  for (let volIdx = 0; volIdx < availableVolunteers.length; volIdx++) {
    const reqIdx = assignment[volIdx];

    // Skip if unassigned or assigned to a padded dummy request
    if (reqIdx === -1 || reqIdx >= activeRequests.length) continue;

    // Skip padded cells
    if (matrix[volIdx][reqIdx] >= PADDING_COST) continue;

    const volunteer = availableVolunteers[volIdx];
    const request = activeRequests[reqIdx];
    const breakdown = breakdowns[volIdx][reqIdx];

    const explanation = generateExplanation(volunteer, request, config);

    assignments.push({
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      requestId: request.id,
      requestTitle: request.title,
      costBreakdown: breakdown,
      explanation,
      assignedAt: Date.now(),
      status: 'pending',
    });
  }

  // Summary statistics
  const totalCost = assignments.reduce((s, a) => s + a.costBreakdown.totalCost, 0);
  const avgEtaMinutes =
    assignments.length > 0
      ? assignments.reduce((s, a) => s + a.costBreakdown.etaMinutes, 0) / assignments.length
      : 0;

  // Display matrix (raw, unpadded)
  const displayMatrix = buildDisplayMatrix(availableVolunteers, activeRequests, config);

  return {
    assignments,
    matrix: displayMatrix,
    volunteerLabels: availableVolunteers.map((v) => v.name.split(' ')[0]),
    requestLabels: activeRequests.map((r) => r.title.split('—')[0].trim().slice(0, 15)),
    totalCost,
    avgEtaMinutes,
    runtimeMs: performance.now() - startMs,
    matchedCount: assignments.length,
    unfilledCount: activeRequests.length - assignments.length,
  };
}

// ─── Greedy Baseline (Demo Only) ──────────────────────────────────────────────

/**
 * Runs the greedy nearest-volunteer baseline for demo comparison.
 * Used only to visually demonstrate Hungarian's superiority.
 */
export function runGreedyBaseline(
  volunteers: Volunteer[],
  requests: DisasterRequest[],
  config: OptimizerConfig = OPTIMIZER_CONFIG,
): GreedyResult {
  const availableVolunteers = volunteers.filter((v) => v.available && v.currentStatus !== 'offline');
  const activeRequests = requests.filter((r) => r.isActive);

  if (availableVolunteers.length === 0 || activeRequests.length === 0) {
    return { assignments: [], totalCost: 0, avgEtaMinutes: 0 };
  }

  const { matrix, breakdowns } = buildCostMatrix(availableVolunteers, activeRequests, config);
  const greedyAssign = greedyAssignment(matrix);

  const assignments: Assignment[] = [];

  for (let volIdx = 0; volIdx < availableVolunteers.length; volIdx++) {
    const reqIdx = greedyAssign[volIdx];
    if (reqIdx === -1 || reqIdx >= activeRequests.length) continue;
    if (matrix[volIdx][reqIdx] >= PADDING_COST) continue;

    const volunteer = availableVolunteers[volIdx];
    const request = activeRequests[reqIdx];
    const breakdown = breakdowns[volIdx][reqIdx];

    assignments.push({
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      requestId: request.id,
      requestTitle: request.title,
      costBreakdown: breakdown,
      explanation: [`Nearest volunteer assigned by greedy algorithm`],
      assignedAt: Date.now(),
      status: 'pending',
    });
  }

  const totalCost = calculateTotalCost(
    matrix.slice(0, availableVolunteers.length).map((r) => r.slice(0, activeRequests.length)),
    greedyAssign.slice(0, availableVolunteers.length),
  );

  const avgEtaMinutes =
    assignments.length > 0
      ? assignments.reduce((s, a) => s + a.costBreakdown.etaMinutes, 0) / assignments.length
      : 0;

  return { assignments, totalCost, avgEtaMinutes };
}
