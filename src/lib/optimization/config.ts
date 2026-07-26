/**
 * CrisisConnect — Optimizer Configuration
 * Central configuration for the Hungarian Algorithm optimizer.
 * Modify this file to adjust weights without touching any algorithm code.
 */

import type { OptimizerConfig } from '@/types/optimizer';

export const OPTIMIZER_CONFIG: OptimizerConfig = {
  weights: {
    /**
     * ETA weight (50%): Travel time dominates the cost — getting volunteers
     * to the site quickly is the top priority in disaster response.
     */
    eta: 0.5,
    /**
     * Severity weight (30%): Critical disasters must be served first.
     * The penalty is inverted — critical gets penalty=0 to minimize cost.
     */
    severity: 0.3,
    /**
     * Resource mismatch weight (20%): Skill matching matters but is less
     * critical than proximity and urgency.
     */
    resource: 0.2,
  },
  /**
   * Road factor: Straight-line Haversine distance × roadFactor ≈ actual road distance.
   * 1.3 is a conservative approximation for Indian urban/semi-urban roads.
   */
  roadFactor: 1.3,
  /**
   * Average travel speed in km/h used for ETA calculation.
   * 40 km/h accounts for disaster-affected roads and traffic.
   */
  speedKmh: 40,
  /**
   * Maximum ETA in minutes used for normalization.
   * Any ETA beyond this is capped to prevent outliers from skewing the matrix.
   */
  maxEtaMinutes: 120,
};

/**
 * Future extensibility: additional weight factors can be added here.
 * The optimizer.ts orchestrator checks for these optional fields.
 */
export const FUTURE_WEIGHTS = {
  fatigue: 0,         // Volunteer fatigue level penalty
  vehicleSuitability: 0, // Vehicle type match
  weatherImpact: 0,   // Road condition factor
  trafficFactor: 0,   // Real-time traffic multiplier
  languageMatch: 0,   // Language compatibility
  reliability: 0,     // Historical response reliability
};

/** Severity penalty values — lower = higher urgency = lower cost */
export const SEVERITY_PENALTIES: Record<string, number> = {
  critical: 0,
  high: 2,
  medium: 5,
  low: 8,
};

/** Sentinel value used to pad rectangular matrices */
export const PADDING_COST = 999;
