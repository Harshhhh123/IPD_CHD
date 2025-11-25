# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict
import joblib
import pandas as pd
import numpy as np
import shap
import traceback
import os
from fastapi.responses import FileResponse
import uuid
from fastapi.middleware.cors import CORSMiddleware


# ---------------------------
# Local paths (files are in same folder as main.py)
# ---------------------------
MODEL_PATH = "heart_disease_model_6pY721cT8p.pkl"
SCALER_PATH = "scaler_YDMGtDrnnw.pkl"
X_TRAIN_PATHS = ["X_train", "X_train.csv"]  # try joblib/no-ext or CSV

# ---------------------------
# Feature engineering (keep as your original)
# ---------------------------
def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # derived features used in training - do NOT change names/order unless model was changed
    df["pulse_pressure"] = df["sysBP"] - df["diaBP"]
    df["bp_ratio"] = df["sysBP"] / (df["diaBP"] + 1e-5)
    df["chol_bmi_ratio"] = df["totChol"] / (df["BMI"] + 1e-6)
    df["age_glucose_interaction"] = df["age"] * df["glucose"]
    df["bpmeds_hyp"] = df["BPMeds"] * df["prevalentHyp"]
    df["smoker_intensity"] = df.get("currentSmoker", 0) * df.get("cigsPerDay", 0)
    return df

FEATURE_ORDER = [
    'male','age','cigsPerDay','BPMeds','prevalentStroke','prevalentHyp','diabetes',
    'totChol','sysBP','diaBP','BMI','glucose','currentSmoker',
    'pulse_pressure','bp_ratio','chol_bmi_ratio','age_glucose_interaction','bpmeds_hyp','smoker_intensity'
]

# ---------------------------
# Input schema (same as before)
# ---------------------------
class UserInput(BaseModel):
    male: int
    age: float
    cigsPerDay: float
    BPMeds: int
    prevalentStroke: int
    prevalentHyp: int
    diabetes: int
    totChol: float
    sysBP: float
    diaBP: float
    BMI: float
    glucose: float
    c

app = FastAPI(title="Heart Disease Predictor (FastAPI + SHAP)")

origins = [
    "http://localhost:5173",   # Vite/React dev server (your frontend)
    "http://127.0.0.1:5173",
    "http://localhost:3000",   # if you sometimes use CRA/other ports
    "http://127.0.0.1:3000",
    "*",
    "https://chd-prediction-75946.web.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # or ["*"] for quick dev (not recommended for prod)
    allow_credentials=True,
    allow_methods=["*"],             # allow all HTTP methods (GET, POST, OPTIONS...)
    allow_headers=["*"],             # allow any headers (Content-Type, Authorization...)
)
# ---------------------------
# Load model & scaler (first)
# ---------------------------
try:
    model = joblib.load(MODEL_PATH)
    print(f"Loaded model from {MODEL_PATH}")
except Exception as e:
    raise RuntimeError(f"Failed to load model at {MODEL_PATH}: {e}")

try:
    scaler = joblib.load(SCALER_PATH)
    print(f"Loaded scaler from {SCALER_PATH}")
except Exception as e:
    raise RuntimeError(f"Failed to load scaler at {SCALER_PATH}: {e}")

# ---------------------------
# Determine expected feature names (robust)
# ---------------------------
if hasattr(scaler, "feature_names_in_"):
    EXPECTED_FEATURE_NAMES = list(scaler.feature_names_in_)
elif hasattr(model, "feature_names_in_"):
    EXPECTED_FEATURE_NAMES = list(model.feature_names_in_)
else:
    EXPECTED_FEATURE_NAMES = FEATURE_ORDER.copy()

EXPECTED_FEATURE_NAMES = [str(c) for c in EXPECTED_FEATURE_NAMES]
print("Model/Scaler expects features (len={}):".format(len(EXPECTED_FEATURE_NAMES)))
print(EXPECTED_FEATURE_NAMES)

# ---------------------------
# Load X_train robustly (to be used as SHAP background)
# - handles CSV, joblib DataFrame, joblib numpy array
# - drops index column 'Unnamed: 0' if present
# - if columns are numeric strings like '0','1' and length matches expected features, rename them
# ---------------------------
X_train_raw = None
for p in X_TRAIN_PATHS:
    try:
        # try CSV first using given path
        path_try = p
        if os.path.exists(p):
            path_try = p
        elif os.path.exists(p + ".csv"):
            path_try = p + ".csv"
        # attempt CSV read (works for files with header or numeric header)
        X_train_raw = pd.read_csv(path_try, header=0)
        print(f"Loaded X_train from CSV: {path_try}")
        break
    except Exception:
        try:
            # fallback to joblib / pickled object
            if os.path.exists(p):
                tmp = joblib.load(p)
                if isinstance(tmp, pd.DataFrame):
                    X_train_raw = tmp
                else:
                    # numpy array -> convert to DF
                    X_train_raw = pd.DataFrame(tmp)
                print(f"Loaded X_train via joblib: {p}")
                break
        except Exception:
            continue

if X_train_raw is None:
    print("No X_train background found; /explain will return an error if invoked.")
else:
    # drop index column if present
    if X_train_raw.shape[1] > 0 and str(X_train_raw.columns[0]).lower() in ["unnamed: 0", "index"]:
        X_train_raw = X_train_raw.iloc[:, 1:].reset_index(drop=True)
        print("Dropped Unnamed: 0 / index column from X_train")

    # helper to detect numeric-like columns
    def looks_like_numeric_column_names(cols):
        for c in cols:
            if isinstance(c, int):
                continue
            if isinstance(c, str) and c.isdigit():
                continue
            return False
        return True

    # if numeric-like and length matches our expected features, rename
    if looks_like_numeric_column_names(list(X_train_raw.columns)):
        if X_train_raw.shape[1] == len(EXPECTED_FEATURE_NAMES):
            X_train_raw.columns = EXPECTED_FEATURE_NAMES.copy()
            print("X_train numeric columns detected -> renamed to EXPECTED_FEATURE_NAMES")
        elif X_train_raw.shape[1] - 1 == len(EXPECTED_FEATURE_NAMES):
            # possibly an extra index-like column kept; drop first then rename
            X_train_raw = X_train_raw.iloc[:, 1:]
            X_train_raw.columns = EXPECTED_FEATURE_NAMES.copy()
            print("Dropped first numeric col then renamed remaining to EXPECTED_FEATURE_NAMES")
        else:
            print("Warning: X_train numeric columns count != expected feature count. Leaving as-is.")
    else:
        print("X_train columns appear non-numeric; using existing column names as-is.")

    X_train_raw = X_train_raw.reset_index(drop=True)
    print("Final X_train columns:", list(X_train_raw.columns))

# ---------------------------
# Create/cached SHAP explainer at startup (optional; faster on repeated calls)
# ---------------------------
_cached_explainer = None
try:
    if X_train_raw is not None:
        # prepare background: apply the same feature engineering and scaler alignment
        X_bg_fe = feature_engineering(X_train_raw.copy())

        # Align to EXPECTED_FEATURE_NAMES. If missing columns, attempt to fill with means or zeros
        missing_bg_cols = [c for c in EXPECTED_FEATURE_NAMES if c not in X_bg_fe.columns]
        if missing_bg_cols:
            for c in missing_bg_cols:
                if c in X_train_raw.columns:
                    X_bg_fe[c] = X_train_raw[c].mean()
                else:
                    X_bg_fe[c] = 0.0

        # If there are extra columns, drop them
        extra_bg_cols = [c for c in X_bg_fe.columns if c not in EXPECTED_FEATURE_NAMES]
        if extra_bg_cols:
            X_bg_fe = X_bg_fe.drop(columns=extra_bg_cols, errors="ignore")

        X_bg = X_bg_fe[EXPECTED_FEATURE_NAMES]
        X_bg_scaled = scaler.transform(X_bg)

        # sample background for speed
        n_bg = min(100, X_bg_scaled.shape[0])
        bg_sample = X_bg_scaled[np.random.RandomState(0).choice(X_bg_scaled.shape[0], n_bg, replace=False)]

        # wrapper for predict_proba that accepts scaled inputs
        def _f_prob(X):
            return model.predict_proba(X)

        # build explainer (uses model output space)
        _cached_explainer = shap.Explainer(_f_prob, bg_sample)
        print("Cached SHAP explainer created at startup.")
except Exception as e:
    print("Could not create cached SHAP explainer at startup:", e)

# ---------------------------
# Helper to preprocess a single input into scaled numpy array (robust)
# ---------------------------
def preprocess_input(df_input: pd.DataFrame) -> tuple:
    """
    Returns: X_scaled (np.ndarray), df_final (post-engineering DataFrame in the order used for prediction)
    Aligns input to EXPECTED_FEATURE_NAMES (filling missing names with mean from X_train or 0.0)
    """
    df_fe = feature_engineering(df_input.copy())

    # fill any expected columns missing
    missing = [c for c in EXPECTED_FEATURE_NAMES if c not in df_fe.columns]
    if missing:
        for c in missing:
            if X_train_raw is not None and c in X_train_raw.columns:
                df_fe[c] = X_train_raw[c].mean()
            else:
                df_fe[c] = 0.0

    # drop extras
    extras = [c for c in df_fe.columns if c not in EXPECTED_FEATURE_NAMES]
    if extras:
        df_fe = df_fe.drop(columns=extras, errors="ignore")

    # reorder
    df_final = df_fe[EXPECTED_FEATURE_NAMES]

    # scale
    X_scaled = scaler.transform(df_final)

    return X_scaled, df_final

# ---------------------------
# Predict endpoint (KEEP EXACTLY AS IT WAS)
# ---------------------------
@app.post("/predict")
def predict(data: UserInput) -> Dict:
    try:
        df = pd.DataFrame([data.dict()])
        X_scaled, df_final = preprocess_input(df)
        prob = model.predict_proba(X_scaled)[0][1]
        pred = int(prob >= 0.5)
        return {"prediction": pred, "probability": float(prob), "features": df_final.iloc[0].to_dict()}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------
# Explain endpoint (SHAP) - uses cached explainer if available
# ---------------------------
@app.post("/explain")
def explain(data: UserInput) -> Dict:
    if X_train_raw is None:
        raise HTTPException(status_code=500, detail="X_train background not found on server; needed for SHAP background.")

    try:
        # preprocess user input
        df = pd.DataFrame([data.dict()])
        X_scaled, df_final = preprocess_input(df)

        # use cached explainer if ready
        explainer = _cached_explainer
        if explainer is None:
            # Build explainer on-demand (slower)
            # prepare background same as startup logic
            X_bg_fe = feature_engineering(X_train_raw.copy())
            missing_bg_cols = [c for c in EXPECTED_FEATURE_NAMES if c not in X_bg_fe.columns]
            if missing_bg_cols:
                for c in missing_bg_cols:
                    if c in X_train_raw.columns:
                        X_bg_fe[c] = X_train_raw[c].mean()
                    else:
                        X_bg_fe[c] = 0.0
            extra_bg_cols = [c for c in X_bg_fe.columns if c not in EXPECTED_FEATURE_NAMES]
            if extra_bg_cols:
                X_bg_fe = X_bg_fe.drop(columns=extra_bg_cols, errors="ignore")
            X_bg = X_bg_fe[EXPECTED_FEATURE_NAMES]
            X_bg_scaled = scaler.transform(X_bg)
            n_bg = min(100, X_bg_scaled.shape[0])
            bg_sample = X_bg_scaled[np.random.RandomState(0).choice(X_bg_scaled.shape[0], n_bg, replace=False)]
            def _f_prob(X): return model.predict_proba(X)
            explainer = shap.Explainer(_f_prob, bg_sample)

        # compute shap values for our instance (explainer expects same scaled input shape)
        shap_values = explainer(X_scaled)

        # shap_values.values handling for binary-class vs single-array
        try:
            # many shap versions for predict_proba return shape (n_samples, n_features, n_classes)
            sv = shap_values.values
            if sv.ndim == 3:
                # take class=1 contributions
                sv_use = sv[:, :, 1]
            elif sv.ndim == 2:
                sv_use = sv
            else:
                # fallback flatten
                sv_use = np.array(sv).reshape(1, -1)
        except Exception:
            # last-resort: try shap_values.data or shap_values[0]
            sv_use = np.array(shap_values)[0]

        feature_importance = {EXPECTED_FEATURE_NAMES[i]: float(sv_use[0][i]) for i in range(len(EXPECTED_FEATURE_NAMES))}

        return {"shap_values": feature_importance, "features_used": df_final.iloc[0].to_dict()}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain_image")
def explain_image(data: UserInput):
    """
    Returns a PNG image of SHAP bar chart for the single input.
    """
    try:
        # reuse existing explain logic to get shap values and feature dict
        resp = explain(data)  # this returns {"shap_values": ..., "features_used": ...}
        shap_vals = resp["shap_values"]
        features_used = resp["features_used"]

        # create filename
        fname = f"shap_{uuid.uuid4().hex[:8]}.png"
        out_path = os.path.join(os.getcwd(), fname)

        # plot and save
        from utils_plot import plot_shap_values
        plot_shap_values(shap_vals, feature_values=features_used, out_path=out_path)

        # return the PNG file
        return FileResponse(out_path, media_type="image/png", filename=fname)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/")
def root():
    return {"message": "FastAPI heart disease backend running (predict + explain)"}
