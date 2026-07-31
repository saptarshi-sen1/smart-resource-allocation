"""Quick sanity checks on the synthetic incident dataset."""

import pandas as pd

DATA_PATH = "./data/synthetic_incidents.csv"

df = pd.read_csv(DATA_PATH)

print("=== Average response_time_minutes by resource_type ===")
print(df.groupby("resource_type")["response_time_minutes"].mean().round(2))
print()

print("=== Average response_time_minutes by traffic_level ===")
print(df.groupby("traffic_level")["response_time_minutes"].mean().round(2))
print()

print("=== Average response_time_minutes by road_type ===")
print(df.groupby("road_type")["response_time_minutes"].mean().round(2))
print()

# Correlation check: similar distance, low vs high traffic
mid_distance = df[(df["distance_km"] >= 9) & (df["distance_km"] <= 11)]
traffic_compare = mid_distance.groupby("traffic_level")["response_time_minutes"].mean()

print("=== Distance 9-11 km: traffic_level 0 vs 3 ===")
print(f"traffic_level=0: {traffic_compare.get(0, float('nan')):.2f} min")
print(f"traffic_level=3: {traffic_compare.get(3, float('nan')):.2f} min")
if 0 in traffic_compare.index and 3 in traffic_compare.index:
    delta = traffic_compare[3] - traffic_compare[0]
    print(f"difference:      {delta:+.2f} min (higher traffic -> longer response)")
