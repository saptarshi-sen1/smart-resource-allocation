/**
 * CrisisConnect — ETA Calculator
 * Estimates travel time from a volunteer to a disaster request location
 * using the Haversine great-circle distance formula.
 */

import type { Volunteer, DisasterRequest, OptimizerConfig } from '@/types/optimizer';

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — computes the great-circle distance between two
 * geographic coordinates in kilometres.
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculates the estimated travel time in minutes from a volunteer's
 * current position to a disaster request location.
 *
 * ETA = (Haversine distance × road factor) / speed × 60
 */
export function calculateEtaMinutes(
  volunteer: Volunteer,
  request: DisasterRequest,
  config: OptimizerConfig,
): number {
  const distanceKm = haversineKm(
    volunteer.latitude,
    volunteer.longitude,
    request.latitude,
    request.longitude,
  );

  const roadDistanceKm = distanceKm * config.roadFactor;
  const etaHours = roadDistanceKm / config.speedKmh;
  return etaHours * 60;
}

/**
 * Calculates the straight-line Haversine distance in km between
 * a volunteer and a request. Used for display purposes.
 */
export function calculateDistanceKm(
  volunteer: Volunteer,
  request: DisasterRequest,
): number {
  return haversineKm(
    volunteer.latitude,
    volunteer.longitude,
    request.latitude,
    request.longitude,
  );
}

/**
 * Normalizes an ETA value to a 0–10 scale for use in the cost matrix.
 * ETA at or beyond maxEtaMinutes is capped at 10.
 *
 * @param etaMinutes - Raw ETA in minutes
 * @param maxEtaMinutes - Maximum ETA for normalization (from config)
 * @returns Normalized value between 0 and 10
 */
export function normalizeEta(etaMinutes: number, maxEtaMinutes: number): number {
  return Math.min(10, (etaMinutes / maxEtaMinutes) * 10);
}

/**
 * Formats ETA minutes into a human-readable string.
 */
export function formatEta(etaMinutes: number): string {
  if (etaMinutes < 1) return 'Under 1 min';
  if (etaMinutes < 60) return `${Math.round(etaMinutes)} min`;
  const hours = Math.floor(etaMinutes / 60);
  const mins = Math.round(etaMinutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
