"""Compare model prediction against similar rows in the training dataset.

Run from inside the response_time_prediction folder:
    python validate_prediction.py
"""

import pandas as pd

DATA_PATH = "./data/synthetic_incidents.csv"

df = pd.read_csv(DATA_PATH)

mask = (
    (df["distance_km"] >= 11)
    & (df["distance_km"] <= 14)
    & (df["traffic_level"] == 2)
    & (df["road_type"] == "urban")
    & (df["resource_type"] == "ambulance")
)
matched = df.loc[mask]

print("=== Rows matching predict.py sample (similar conditions) ===")
print("Filters: distance_km 11-14, traffic_level=2, road_type=urban, resource_type=ambulance")
print()
print(f"Matching rows: {len(matched)}")
if len(matched) > 0:
    avg = matched["response_time_minutes"].mean()
    print(f"Average response_time_minutes: {avg:.2f}")
    print()
    print("Model prediction (predict.py sample): 60.69 minutes")
    print(f"Difference (model - data avg): {60.69 - avg:+.2f} minutes")
else:
    print("No matching rows found.")
