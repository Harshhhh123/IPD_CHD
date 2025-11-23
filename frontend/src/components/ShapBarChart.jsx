// src/components/ShapBarChart.jsx - Enhanced version (you can keep old one for backwards compatibility)
import React, { useMemo, useState } from "react";
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

const featureNameMap = {
  sysBP: "Systolic BP",
  diaBP: "Diastolic BP",
  totChol: "Total Cholesterol",
  BMI: "Body Mass Index",
  glucose: "Blood Glucose",
  age: "Age",
  currentSmoker: "Current Smoker",
  cigsPerDay: "Cigarettes/Day",
  pulse_pressure: "Pulse Pressure",
  bp_ratio: "BP Ratio",
  chol_bmi_ratio: "Chol/BMI Ratio",
  age_glucose_interaction: "Age × Glucose",
  bpmeds_hyp: "BP Meds × Hypertension",
  smoker_intensity: "Smoking Intensity",
  male: "Gender (Male)",
  BPMeds: "BP Medication",
  prevalentStroke: "Previous Stroke",
  prevalentHyp: "Hypertension",
  diabetes: "Diabetes",
};

function humanize(name) {
  return featureNameMap[name] || name;
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  const impact = p.shap >= 0 ? "increases" : "decreases";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 max-w-xs"
    >
      <div className="font-semibold text-gray-900 mb-2 text-sm">{p.name}</div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-600">Your Value:</span>
          <span className="font-bold text-gray-900">
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-600">Impact:</span>
          <span className={`font-bold ${p.shap >= 0 ? "text-red-600" : "text-blue-600"}`}>
            {p.shap >= 0 ? "+" : ""}{(p.shap * 100).toFixed(2)}%
          </span>
        </div>
        <div className="pt-2 mt-2 border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed">
            This feature <span className="font-semibold">{impact}</span> your risk
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function ShapBarChart({
  shapValues = {},
  featureValues = {},
  topN = 12,
  signed = true,
}) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const data = useMemo(() => {
    const arr = Object.keys(shapValues).map((k) => ({
      feature: k,
      name: humanize(k),
      shap: Number(shapValues[k]),
      value: featureValues?.[k] ?? "",
      abs: Math.abs(Number(shapValues[k])),
    }));
    return arr
      .sort((a, b) => b.abs - a.abs)
      .slice(0, topN)
      .reverse();
  }, [shapValues, featureValues, topN]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full"
      style={{ minHeight: 400 }}
    >
      <div style={{ width: "100%", height: Math.max(500, data.length * 42) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive) {
                setHoveredBar(state.activeTooltipIndex);
              } else {
                setHoveredBar(null);
              }
            }}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              horizontal={true} 
              vertical={false} 
              stroke="#e5e7eb"
              opacity={0.5}
            />
            <XAxis
              type="number"
              tickFormatter={(v) => (v * 100).toFixed(1) + "%"}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#d1d5db" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={180}
              tick={{ fill: "#374151", fontSize: 13, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar 
              dataKey={signed ? "shap" : "abs"}
              radius={[0, 8, 8, 0]}
              animationDuration={1000}
              animationBegin={200}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.shap >= 0 ? "url(#positiveGradient)" : "url(#negativeGradient)"}
                  opacity={hoveredBar === null || hoveredBar === index ? 1 : 0.3}
                  style={{
                    filter: hoveredBar === index ? "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" : "none",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}