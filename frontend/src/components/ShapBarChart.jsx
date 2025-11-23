// src/components/ShapBarChart.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

function humanize(name) {
  // quick mapping for nicer labels (extend as needed)
  const map = {
    sysBP: "Systolic BP",
    diaBP: "Diastolic BP",
    totChol: "Total Cholesterol",
    BMI: "BMI",
    glucose: "Glucose",
    age: "Age",
    currentSmoker: "Current Smoker",
    cigsPerDay: "Cigs / day",
    pulse_pressure: "Pulse Pressure",
    bp_ratio: "BP Ratio",
    chol_bmi_ratio: "Chol/BMI",
    age_glucose_interaction: "Age × Glucose",
    bpmeds_hyp: "BPmeds × Hyp",
    smoker_intensity: "Smoker Intensity",
    male: "Male",
  };
  return map[name] || name;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white p-2 rounded shadow text-sm">
      <div className="font-semibold">{humanize(p.feature)}</div>
      <div>SHAP: {p.shap.toFixed(4)}</div>
      <div>Value: {p.value}</div>
    </div>
  );
};

export default function ShapBarChart({
  shapValues = {},
  featureValues = {},
  topN = 12,
  signed = true,
}) {
  const data = useMemo(() => {
    const arr = Object.keys(shapValues).map((k) => ({
      feature: k,
      name: humanize(k),
      shap: Number(shapValues[k]),
      value: featureValues?.[k] ?? "",
      abs: Math.abs(Number(shapValues[k])),
    }));
    // sort by absolute importance descending and take topN
    const sorted = arr.sort((a, b) => b.abs - a.abs).slice(0, topN);
    // reverse for vertical ordering (biggest at top)
    return sorted.reverse();
  }, [shapValues, featureValues, topN]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-lg p-4"
      style={{ minHeight: 320 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Feature contributions (SHAP)</h3>
        <div className="text-sm text-gray-500">Top {data.length} features</div>
      </div>

      <div style={{ width: "100%", height: Math.max(320, data.length * 36) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 24, left: 80, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => v.toFixed(3)}
              domain={['dataMin', 'dataMax']}
              // center at zero looks nice; recharts handles neg/pos
            />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 13 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={signed ? "shap" : "abs"} isAnimationActive>
              {
                data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.shap >= 0 ? "rgba(229,62,62,0.95)" : "rgba(14,165,233,0.95)"}
                    stroke="rgba(0,0,0,0.04)"
                    radius={[4, 4, 4, 4]}
                  />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
