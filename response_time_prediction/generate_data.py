"""
Synthetic incident dataset generator for emergency dispatch response-time prediction.

Generates 10,000 labeled samples where response_time_minutes is derived from
realistic physics-inspired rules (speed, distance, traffic, weather, rush hour,
resource type) plus small Gaussian noise so a downstream ML model can learn the
underlying patterns.

Run from inside the response_time_prediction folder:
    python generate_data.py
"""

import os

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Reproducibility
# ---------------------------------------------------------------------------
np.random.seed(42)
rng = np.random.default_rng(42)

N_SAMPLES = 10_000
OUTPUT_PATH = "./data/synthetic_incidents.csv"

# ---------------------------------------------------------------------------
# Domain constants used in the response-time formula
# ---------------------------------------------------------------------------

# Base cruising speed (km/h) by road type.
# Highway allows sustained high speed; urban streets have signals and congestion;
# rural roads are faster than urban but slower than highways (narrower, fewer lanes).
ROAD_BASE_SPEED_KMH = {
    "highway": 70.0,
    "rural": 45.0,
    "urban": 28.0,
}

# Traffic level scales effective speed (0 = clear, 3 = heavy jam).
# Lower multiplier means slower travel and longer response time.
TRAFFIC_SPEED_MULTIPLIER = {
    0: 1.00,
    1: 0.82,
    2: 0.65,
    3: 0.45,
}

# Ground-vehicle priority / maneuverability by agency type.
# Ambulances and police often get priority routing; fire/NDRF trucks are larger.
RESOURCE_SPEED_MODIFIER = {
    "ambulance": 1.15,
    "police": 1.08,
    "fire": 0.92,
    "ndrf": 0.85,
}

# Drones travel point-to-point and ignore road network constraints.
DRONE_CRUISE_SPEED_KMH = 75.0

# Fixed dispatch overhead (minutes) before wheels-up / wheels-on-road movement.
DISPATCH_OVERHEAD_MINUTES = {
    "drone": 0.5,
    "ground": 2.0,
}

# Gaussian noise std dev (minutes) — keeps data learnable but not perfectly deterministic.
NOISE_STD_MINUTES = 1.5

# Minimum realistic response time (minutes).
MIN_RESPONSE_TIME_MINUTES = 1.0


def is_rush_hour(hour: np.ndarray) -> np.ndarray:
    """
    Return True for rush-hour windows:
    - Morning peak: 08:00-10:00
    - Evening peak: 17:00-19:00 (5-8 PM)
    """
    morning_peak = (hour >= 8) & (hour <= 10)
    evening_peak = (hour >= 17) & (hour <= 19)
    return morning_peak | evening_peak


def compute_response_time_minutes(df: pd.DataFrame, noise: np.ndarray) -> np.ndarray:
    """
    Compute response_time_minutes from incident features.

    Ground vehicles:
      travel_time = distance / effective_speed
      effective_speed = base_road_speed
                        x traffic_factor
                        x weather_factor
                        x rush_hour_factor
                        x resource_type_factor

    Drones:
      - Use fixed cruise speed (much faster than typical ground travel).
      - Ignore road_type and traffic_level (aerial routing).
      - Weather still reduces speed (wind, visibility).

    Finally add dispatch overhead, Gaussian noise, and clip to a minimum of 1 min.
    """
    is_drone = df["resource_type"].values == "drone"
    rush_hour = is_rush_hour(df["time_of_day"].values)

    # --- Ground vehicle speed components ---
    road_speed = df["road_type"].map(ROAD_BASE_SPEED_KMH).values
    traffic_factor = df["traffic_level"].map(TRAFFIC_SPEED_MULTIPLIER).values

    # Weather severity 0-10: up to ~35% speed reduction for ground vehicles.
    weather_factor_ground = 1.0 - 0.035 * df["weather_severity"].values

    # Rush hour adds ~25% travel time (equivalent to ~22% speed reduction).
    rush_hour_factor = np.where(rush_hour, 0.78, 1.0)

    # Drones bypass ground-vehicle modifiers; other types get agency-specific factors.
    resource_factor = df["resource_type"].map(RESOURCE_SPEED_MODIFIER).values
    resource_factor = np.where(is_drone, 1.0, resource_factor)

    ground_speed_kmh = (
        road_speed * traffic_factor * weather_factor_ground * rush_hour_factor * resource_factor
    )

    # --- Drone speed (independent of roads and traffic) ---
    # Weather has a stronger effect on drones (wind, rain, visibility).
    weather_factor_drone = 1.0 - 0.05 * df["weather_severity"].values
    drone_speed_kmh = DRONE_CRUISE_SPEED_KMH * weather_factor_drone

    # Pick effective speed by resource type; floor avoids divide-by-zero outliers.
    effective_speed_kmh = np.where(is_drone, drone_speed_kmh, ground_speed_kmh)
    effective_speed_kmh = np.maximum(effective_speed_kmh, 5.0)

    # Core travel time: time = distance / speed, converted to minutes.
    travel_time_minutes = (df["distance_km"].values / effective_speed_kmh) * 60.0

    # Dispatch / mobilization delay before movement begins.
    dispatch_overhead = np.where(
        is_drone, DISPATCH_OVERHEAD_MINUTES["drone"], DISPATCH_OVERHEAD_MINUTES["ground"]
    )

    response_time = travel_time_minutes + dispatch_overhead + noise
    return np.clip(response_time, MIN_RESPONSE_TIME_MINUTES, None)


def generate_features(n_samples: int) -> pd.DataFrame:
    """Generate n_samples random incident feature rows."""
    return pd.DataFrame(
        {
            "distance_km": rng.uniform(0.5, 30.0, size=n_samples),
            "traffic_level": rng.integers(0, 4, size=n_samples),
            "road_type": rng.choice(["highway", "urban", "rural"], size=n_samples),
            "weather_severity": rng.uniform(0.0, 10.0, size=n_samples),
            "time_of_day": rng.integers(0, 24, size=n_samples),
            "resource_type": rng.choice(
                ["ambulance", "fire", "police", "ndrf", "drone"],
                size=n_samples,
            ),
        }
    )


def main() -> None:
    df = generate_features(N_SAMPLES)

    # Small random noise so labels are not perfectly deterministic.
    noise = rng.normal(0.0, NOISE_STD_MINUTES, size=N_SAMPLES)
    df["response_time_minutes"] = compute_response_time_minutes(df, noise)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)

    print(f"Saved {len(df):,} samples to {OUTPUT_PATH}\n")
    print("First 5 rows:")
    print(df.head())
    print("\nBasic statistics:")
    print(df.describe())


if __name__ == "__main__":
    main()
