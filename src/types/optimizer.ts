/**
 * CrisisConnect — Optimizer Type Definitions
 * Strict TypeScript interfaces for the Hungarian Algorithm assignment pipeline.
 */

// ─── Volunteer ───────────────────────────────────────────────────────────────

export type VolunteerStatus = 'available' | 'en-route' | 'on-site' | 'resting' | 'offline';
export type VehicleType = 'motorcycle' | 'car' | 'suv' | 'truck' | 'boat' | 'none';

export interface Volunteer {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  skills: string[];
  certifications: string[];
  vehicleType: VehicleType;
  available: boolean;
  capacity: number;           // max people that can be transported
  previousAssignments: number;
  fatigueLevel: number;       // 0–10, 0 = fresh, 10 = exhausted
  currentStatus: VolunteerStatus;
  phone?: string;
  city?: string;
}

// ─── Disaster Request ─────────────────────────────────────────────────────────

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type DisasterType = 'flood' | 'cyclone' | 'fire' | 'earthquake' | 'medical' | 'other';

export interface DisasterRequest {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  disasterType: DisasterType;
  requiredSkills: string[];
  peopleAffected: number;
  suppliesNeeded: string[];
  estimatedDuration: string;
  ngoId: string;
  ngoName: string;
  timestamp: number;          // unix ms
  isActive: boolean;
}

// ─── Cost Components ─────────────────────────────────────────────────────────

export interface CostBreakdown {
  /** Estimated travel time in minutes */
  etaMinutes: number;
  /** Normalized ETA component (0–10 scale) */
  etaComponent: number;
  /** Severity urgency penalty (0–8) */
  severityPenalty: number;
  /** Skill/resource mismatch penalty (0–10) */
  resourceMismatch: number;
  /** Weighted total cost */
  totalCost: number;
  /** Distance in km */
  distanceKm: number;
}

// ─── Assignment ───────────────────────────────────────────────────────────────

export type AssignmentStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'rejected';

export interface Assignment {
  volunteerId: string;
  volunteerName: string;
  requestId: string;
  requestTitle: string;
  costBreakdown: CostBreakdown;
  /** Human-readable explanation of why this volunteer was chosen */
  explanation: string[];
  assignedAt: number;         // unix ms
  status: AssignmentStatus;
}

// ─── Optimization Result ──────────────────────────────────────────────────────

export interface OptimizationResult {
  assignments: Assignment[];
  /** Full cost matrix [volunteer][request] */
  matrix: number[][];
  /** Volunteer labels for matrix rows */
  volunteerLabels: string[];
  /** Request labels for matrix columns */
  requestLabels: string[];
  /** Sum of all assignment costs */
  totalCost: number;
  /** Average ETA across all assignments in minutes */
  avgEtaMinutes: number;
  /** Wall-clock time the algorithm took in ms */
  runtimeMs: number;
  /** Number of volunteers matched */
  matchedCount: number;
  /** Number of requests that could not be filled */
  unfilledCount: number;
}

// ─── Greedy Comparison ────────────────────────────────────────────────────────

export interface GreedyResult {
  assignments: Assignment[];
  totalCost: number;
  avgEtaMinutes: number;
}

// ─── Optimizer Config ─────────────────────────────────────────────────────────

export interface OptimizerWeights {
  /** Weight for ETA component (default 0.5) */
  eta: number;
  /** Weight for severity penalty (default 0.3) */
  severity: number;
  /** Weight for resource mismatch (default 0.2) */
  resource: number;
}

export interface OptimizerConfig {
  weights: OptimizerWeights;
  /** Road factor multiplier applied to straight-line distance (default 1.3) */
  roadFactor: number;
  /** Average travel speed in km/h (default 40) */
  speedKmh: number;
  /** Maximum ETA in minutes used for normalization (default 120) */
  maxEtaMinutes: number;
}
