# utils_plot.py
import matplotlib.pyplot as plt
import numpy as np
import io
from PIL import Image

def plot_shap_values(shap_dict, feature_values=None, title="SHAP contributions", out_path=None):
    """
    shap_dict: {feature_name: shap_value, ...}
    feature_values: optional dict of {feature_name: raw_value}
    out_path: if provided, saves PNG to this path and returns path. Otherwise returns PIL.Image.
    Returns: (image_or_path)
    """
    # convert to lists and sort by absolute importance
    items = list(shap_dict.items())
    names = [k for k, v in items]
    vals = np.array([v for k, v in items], dtype=float)
    abs_idx = np.argsort(np.abs(vals))
    names_sorted = [names[i] for i in abs_idx]
    vals_sorted = vals[abs_idx]

    plt.figure(figsize=(8, max(4, len(names_sorted) * 0.3)))
    bars = plt.barh(names_sorted, vals_sorted)
    plt.axvline(0, color='k', linewidth=0.6)
    plt.xlabel("SHAP value (contribution toward class=1)")
    plt.title(title)
    plt.grid(axis="x", linestyle="--", linewidth=0.4)

    # annotate bars with raw values if provided
    if feature_values is not None:
        for i, (name, v) in enumerate(zip(names_sorted, vals_sorted)):
            raw = feature_values.get(name, "")
            plt.text(v + (0.001 if v >= 0 else -0.001), i, f"{v:.3f} (val={raw})", va="center", fontsize=8)

    plt.tight_layout()

    # either save or return PIL Image
    if out_path:
        plt.savefig(out_path, dpi=150, bbox_inches="tight")
        plt.close()
        return out_path
    else:
        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        plt.close()
        buf.seek(0)
        img = Image.open(buf)
        return img
