// src/screens/ResultScreen.jsx
import React, { useRef } from "react";
import PredictionCard from "../components/PredictionCard";
import ShapBarChart from "../components/ShapBarChart";
import { toPng } from "html-to-image";

export default function ResultScreen({ finalResult, onStartNew }) {
  const chartRef = useRef(null);

  const handleDownloadPNG = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `shap_chart_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("download error", err);
    }
  };

  if (!finalResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No result to show</h2>
          <p className="text-gray-600">Please complete the assessment first.</p>
          <div className="mt-4">
            <button onClick={() => onStartNew?.()} className="px-4 py-2 bg-indigo-600 text-white rounded">Start New</button>
          </div>
        </div>
      </div>
    );
  }

  const { finalJSON, prediction, probability, shap_values } = finalResult;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <PredictionCard probability={probability ?? 0} onExplainClick={() => document.getElementById("shap-chart")?.scrollIntoView({ behavior: "smooth" })} />
          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="text-xs text-gray-500">Model</div>
            <div className="font-semibold">Coronary Heart Disease Predictor</div>
            <div className="mt-2 text-xs text-gray-500">Explainability shown to the right</div>
            <div className="mt-4">
              <button onClick={() => onStartNew?.()} className="w-full bg-indigo-600 text-white py-2 rounded-lg">Start New Assessment</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div ref={chartRef} id="shap-chart">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Explainability</h2>
              <div className="flex gap-2">
                <button onClick={handleDownloadPNG} className="px-3 py-2 bg-gray-800 text-white rounded">Download PNG</button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow">
              {shap_values ? (
                <ShapBarChart shapValues={shap_values} featureValues={finalJSON} topN={12} signed={true} />
              ) : (
                <div className="text-gray-500">No SHAP data available.</div>
              )}
            </div>

            <div className="mt-6 bg-white p-4 rounded-2xl shadow">
              <h3 className="font-semibold mb-2">Prediction details</h3>
              <pre className="text-xs overflow-auto max-h-48 bg-white/30 p-3 rounded">{JSON.stringify({ probability, prediction, features: finalJSON }, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
