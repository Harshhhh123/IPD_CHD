import pandas as pd
import joblib

try:
    df = pd.read_csv("X_train")
except:
    df = joblib.load("X_train")

print(df.columns)
print("Total columns:", len(df.columns))
