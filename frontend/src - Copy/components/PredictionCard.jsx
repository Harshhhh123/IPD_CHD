// src/components/PredictionCard.jsx - Simplified version (optional, can be deleted)
import React from "react";
import { motion } from "framer-motion";

const getRiskLabel = (p) => {
  if (p >= 0.5) return { label: "High Risk", color: "#ef4444", bg: "bg-red-50" };
  if (p >= 0.2) return { label: "Moderate Risk", color: "#f59e0b", bg: "bg-amber-50" };
  return { label: "Low Risk", color: "#10b981", bg: "bg-green-50" };
};

export default function PredictionCard({ probability = 0, compact = false }) {
  const pct = Math.round(probability * 100);
  const risk = getRiskLabel(probability);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`${risk.bg} backdrop-blur-md rounded-2xl shadow-lg p-6 border-2 border-${risk.color.replace('#', '')}/20`}
    >
      <div className="text-center">
        <div className="text-5xl font-bold mb-2" style={{ color: risk.color }}>
          {pct}%
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {risk.label}
        </div>
        <div className="text-sm text-gray-600">
          Predicted CHD Risk
        </div>
      </div>

      {!compact && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            This model provides informational risk estimate — not a medical diagnosis.
          </p>
        </div>
      )}
    </motion.div>
  );
}