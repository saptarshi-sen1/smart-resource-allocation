"""
Train an XGBoost regressor to predict emergency dispatch response time.

Run from inside the response_time_prediction folder:
    python train.py
"""

import os

import joblib
import pandas as pd
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DATA_PATH = "./data/synthetic_incidents.csv"
MODEL_PATH = "./model/response_time_model.pkl"
FEATURE_COLUMNS_PATH = "./model/feature_columns.pkl"

TARGET_COLUMN = "response_time_minutes"
CATEGORICAL_COLUMNS = ["road_type", "resource_type"]

# ---------------------------------------------------------------------------
# 1. Load the synthetic incident dataset
# ---------------------------------------------------------------------------
df = pd.read_csv(DATA_PATH)
print(f"Loaded {len(df):,} rows from {DATA_PATH}")

# ---------------------------------------------------------------------------
# 2. One-hot encode categorical features
#    get_dummies expands road_type and resource_type into binary columns
#    (e.g. road_type_highway, resource_type_drone) that the model can use.
# ---------------------------------------------------------------------------
df_encoded = pd.get_dummies(df, columns=CATEGORICAL_COLUMNS, dtype=int)

# Separate features (X) from target (y)
feature_columns = [col for col in df_encoded.columns if col != TARGET_COLUMN]
X = df_encoded[feature_columns]
y = df_encoded[TARGET_COLUMN]

# ---------------------------------------------------------------------------
# 3. Train / test split (80 % train, 20 % test, reproducible)
# ---------------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"Training samples: {len(X_train):,}  |  Test samples: {len(X_test):,}")

# ---------------------------------------------------------------------------
# 4. Train XGBoost regressor
# ---------------------------------------------------------------------------
model = XGBRegressor(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,
    random_state=42,
)
model.fit(X_train, y_train)

# ---------------------------------------------------------------------------
# 5. Evaluate on the held-out test set
# ---------------------------------------------------------------------------
y_pred = model.predict(X_test)
test_mae = mean_absolute_error(y_test, y_pred)
print(f"\nTest MAE: {test_mae:.2f} minutes")

# ---------------------------------------------------------------------------
# 6 & 7. Persist model and feature column order for inference
#    feature_columns.pkl must be loaded at prediction time so columns are
#    aligned exactly with what the model was trained on.
# ---------------------------------------------------------------------------
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(model, MODEL_PATH)
joblib.dump(feature_columns, FEATURE_COLUMNS_PATH)
print(f"\nModel saved to {MODEL_PATH}")
print(f"Feature columns saved to {FEATURE_COLUMNS_PATH}")

# ---------------------------------------------------------------------------
# 8. Feature importance ranking
#    XGBoost scores each input feature by how often it is used in splits
#    and how much it reduces loss — higher score = more influential.
# ---------------------------------------------------------------------------
importance = (
    pd.Series(model.feature_importances_, index=feature_columns)
    .sort_values(ascending=False)
)

print("\n=== Feature Importance (top to bottom) ===")
for rank, (feature, score) in enumerate(importance.items(), start=1):
    print(f"  {rank:2d}. {feature:<30s} {score:.4f}")
