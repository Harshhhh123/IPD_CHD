// src/components/PredictionCard.jsx
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { motion } from "framer-motion";
import 'react-circular-progressbar/dist/styles.css';

const getRiskLabel = (p) => {
  if (p >= 0.5) return { label: "High", color: "#E53E3E" }; // red
  if (p >= 0.2) return { label: "Moderate", color: "#D69E2E" }; // amber
  return { label: "Low", color: "#059669" }; // green
};

export default function PredictionCard({ probability = 0, onExplainClick }) {
  // probability in 0..1
  const pct = Math.round(probability * 100);
  const risk = getRiskLabel(probability);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 max-w-sm"
    >
      <div className="w-40 h-40">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <CircularProgressbar
            value={pct}
            text={`${pct}%`}
            strokeWidth={10}
            styles={buildStyles({
              textSize: '22px',
              textColor: '#0f172a', // adapt to theme
              pathColor: risk.color,
              trailColor: '#e6e6e6',
            })}
          />
        </motion.div>
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-500">Predicted risk</div>
        <div className="mt-1 text-2xl font-semibold" style={{color: risk.color}}>
          {risk.label}
        </div>
        <div className="text-xs text-gray-500">Probability based on model</div>
      </div>

      <div className="w-full flex gap-2 mt-2">
        <button
          onClick={onExplainClick}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg shadow"
        >
          Show Explanation
        </button>
        <button
          onClick={() => navigator.clipboard?.writeText(`${(probability*100).toFixed(1)}%`)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
        >
          Copy
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        <strong>Note:</strong> This model provides informational risk estimate — not a medical diagnosis.
      </div>
    </motion.div>
  );
}
