// // src/screens/ResultScreen.jsx
// import React, { useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toPng } from "html-to-image";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Cell,
//   Legend,
// } from "recharts";

// // Enhanced SHAP Chart Component
// const EnhancedShapChart = ({ shapValues, featureValues, topN = 12 }) => {
//   const [hoveredBar, setHoveredBar] = useState(null);

//   const featureNameMap = {
//     sysBP: "Systolic BP",
//     diaBP: "Diastolic BP",
//     totChol: "Total Cholesterol",
//     BMI: "Body Mass Index",
//     glucose: "Blood Glucose",
//     age: "Age",
//     currentSmoker: "Current Smoker",
//     cigsPerDay: "Cigarettes/Day",
//     pulse_pressure: "Pulse Pressure",
//     bp_ratio: "BP Ratio",
//     chol_bmi_ratio: "Cholesterol/BMI Ratio",
//     age_glucose_interaction: "Age × Glucose",
//     bpmeds_hyp: "BP Meds × Hypertension",
//     smoker_intensity: "Smoking Intensity",
//     male: "Gender (Male)",
//     BPMeds: "BP Medication",
//     prevalentStroke: "Previous Stroke",
//     prevalentHyp: "Hypertension",
//     diabetes: "Diabetes",
//   };

//   const humanize = (name) => featureNameMap[name] || name;

//   const data = React.useMemo(() => {
//     const arr = Object.keys(shapValues).map((k) => ({
//       feature: k,
//       name: humanize(k),
//       shap: Number(shapValues[k]),
//       value: featureValues?.[k] ?? "",
//       abs: Math.abs(Number(shapValues[k])),
//     }));
//     return arr
//       .sort((a, b) => b.abs - a.abs)
//       .slice(0, topN)
//       .reverse();
//   }, [shapValues, featureValues, topN]);

//   const CustomTooltip = ({ active, payload }) => {
//     if (!active || !payload || !payload.length) return null;
//     const p = payload[0].payload;
//     const impact = p.shap >= 0 ? "increases" : "decreases";
    
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 max-w-xs"
//       >
//         <div className="font-semibold text-gray-900 mb-2 text-sm">{p.name}</div>
//         <div className="space-y-1.5 text-xs">
//           <div className="flex items-center justify-between gap-3">
//             <span className="text-gray-600">Your Value:</span>
//             <span className="font-bold text-gray-900">
//               {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
//             </span>
//           </div>
//           <div className="flex items-center justify-between gap-3">
//             <span className="text-gray-600">Impact:</span>
//             <span className={`font-bold ${p.shap >= 0 ? "text-red-600" : "text-blue-600"}`}>
//               {p.shap >= 0 ? "+" : ""}{(p.shap * 100).toFixed(2)}%
//             </span>
//           </div>
//           <div className="pt-2 mt-2 border-t border-gray-200">
//             <p className="text-gray-700 leading-relaxed">
//               This feature <span className="font-semibold">{impact}</span> your risk
//             </p>
//           </div>
//         </div>
//       </motion.div>
//     );
//   };

//   return (
//     <div className="w-full" style={{ height: Math.max(500, data.length * 42) }}>
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           layout="vertical"
//           data={data}
//           margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
//           onMouseMove={(state) => {
//             if (state.isTooltipActive) {
//               setHoveredBar(state.activeTooltipIndex);
//             } else {
//               setHoveredBar(null);
//             }
//           }}
//           onMouseLeave={() => setHoveredBar(null)}
//         >
//           <defs>
//             <linearGradient id="positiveGradient" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
//               <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
//             </linearGradient>
//             <linearGradient id="negativeGradient" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
//               <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid 
//             strokeDasharray="3 3" 
//             horizontal={true} 
//             vertical={false} 
//             stroke="#e5e7eb"
//             opacity={0.5}
//           />
//           <XAxis
//             type="number"
//             tickFormatter={(v) => (v * 100).toFixed(1) + "%"}
//             tick={{ fill: "#6b7280", fontSize: 12 }}
//             axisLine={{ stroke: "#d1d5db" }}
//           />
//           <YAxis
//             dataKey="name"
//             type="category"
//             width={180}
//             tick={{ fill: "#374151", fontSize: 13, fontWeight: 500 }}
//             axisLine={false}
//             tickLine={false}
//           />
//           <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
//           <Bar 
//             dataKey="shap" 
//             radius={[0, 8, 8, 0]}
//             animationDuration={1000}
//             animationBegin={200}
//           >
//             {data.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={entry.shap >= 0 ? "url(#positiveGradient)" : "url(#negativeGradient)"}
//                 opacity={hoveredBar === null || hoveredBar === index ? 1 : 0.3}
//                 style={{
//                   filter: hoveredBar === index ? "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" : "none",
//                   transition: "all 0.2s ease",
//                 }}
//               />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// // Risk Gauge Component
// const RiskGauge = ({ probability }) => {
//   const percentage = Math.round(probability * 100);
//   const radius = 90;
//   const circumference = 2 * Math.PI * radius;
//   const offset = circumference - (percentage / 100) * circumference;

//   const getRiskData = (p) => {
//     if (p >= 0.5) return { 
//       label: "High Risk", 
//       color: "#ef4444",
//       bgColor: "bg-red-50",
//       textColor: "text-red-600",
//       borderColor: "border-red-200",
//       gradient: "from-red-500 to-rose-600"
//     };
//     if (p >= 0.2) return { 
//       label: "Moderate Risk", 
//       color: "#f59e0b",
//       bgColor: "bg-amber-50",
//       textColor: "text-amber-600",
//       borderColor: "border-amber-200",
//       gradient: "from-amber-500 to-orange-600"
//     };
//     return { 
//       label: "Low Risk", 
//       color: "#10b981",
//       bgColor: "bg-green-50",
//       textColor: "text-green-600",
//       borderColor: "border-green-200",
//       gradient: "from-green-500 to-emerald-600"
//     };
//   };

//   const risk = getRiskData(probability);

//   return (
//     <motion.div
//       initial={{ scale: 0.8, opacity: 0 }}
//       animate={{ scale: 1, opacity: 1 }}
//       transition={{ duration: 0.6, type: "spring" }}
//       className="relative flex flex-col items-center justify-center"
//     >
//       <svg width="240" height="240" className="transform -rotate-90">
//         {/* Background circle */}
//         <circle
//           cx="120"
//           cy="120"
//           r={radius}
//           stroke="#e5e7eb"
//           strokeWidth="16"
//           fill="none"
//         />
//         {/* Progress circle */}
//         <motion.circle
//           cx="120"
//           cy="120"
//           r={radius}
//           stroke={risk.color}
//           strokeWidth="16"
//           fill="none"
//           strokeLinecap="round"
//           strokeDasharray={circumference}
//           initial={{ strokeDashoffset: circumference }}
//           animate={{ strokeDashoffset: offset }}
//           transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
//           style={{
//             filter: `drop-shadow(0 0 8px ${risk.color}40)`,
//           }}
//         />
//       </svg>
//       <div className="absolute inset-0 flex flex-col items-center justify-center">
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
//           className="text-center"
//         >
//           <div className="text-5xl font-bold text-gray-900 mb-1">{percentage}%</div>
//           <div className={`text-sm font-semibold ${risk.textColor}`}>{risk.label}</div>
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// // Input Summary Card
// const InputSummaryCard = ({ finalJSON }) => {
//   const categories = {
//     "Personal": ["age", "male", "BMI"],
//     "Lifestyle": ["currentSmoker", "cigsPerDay"],
//     "Medical History": ["diabetes", "prevalentStroke", "prevalentHyp", "BPMeds"],
//     "Vitals": ["sysBP", "diaBP", "totChol", "glucose"]
//   };

//   const labelMap = {
//     age: "Age",
//     male: "Gender",
//     BMI: "BMI",
//     currentSmoker: "Current Smoker",
//     cigsPerDay: "Cigarettes/Day",
//     diabetes: "Diabetes",
//     prevalentStroke: "Previous Stroke",
//     prevalentHyp: "Hypertension",
//     BPMeds: "BP Medication",
//     sysBP: "Systolic BP",
//     diaBP: "Diastolic BP",
//     totChol: "Total Cholesterol",
//     glucose: "Blood Glucose"
//   };

//   const formatValue = (key, value) => {
//     if (key === "male") return value === 1 ? "Male" : "Female";
//     if (["currentSmoker", "diabetes", "prevalentStroke", "prevalentHyp", "BPMeds"].includes(key)) {
//       return value === 1 ? "Yes" : "No";
//     }
//     if (typeof value === "number") return value.toFixed(1);
//     return value;
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.3 }}
//       className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden"
//     >
//       <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-4">
//         <h3 className="text-lg font-semibold text-white flex items-center gap-2">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//           </svg>
//           Your Assessment Data
//         </h3>
//       </div>
//       <div className="p-6 space-y-6">
//         {Object.entries(categories).map(([category, keys]) => (
//           <div key={category}>
//             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{category}</h4>
//             <div className="grid grid-cols-2 gap-3">
//               {keys.map((key) => (
//                 finalJSON[key] !== undefined && (
//                   <div key={key} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
//                     <div className="text-xs text-gray-600 mb-1">{labelMap[key] || key}</div>
//                     <div className="text-sm font-semibold text-gray-900">
//                       {formatValue(key, finalJSON[key])}
//                     </div>
//                   </div>
//                 )
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// export default function ResultScreen({ finalResult, onStartNew }) {
//   const chartRef = useRef(null);
//   const [showDiveDeeper, setShowDiveDeeper] = useState(false);

//   const handleDownloadPNG = async () => {
//     if (!chartRef.current) return;
//     try {
//       const dataUrl = await toPng(chartRef.current, { cacheBust: true, pixelRatio: 2 });
//       const link = document.createElement("a");
//       link.download = `heart-health-analysis-${Date.now()}.png`;
//       link.href = dataUrl;
//       link.click();
//     } catch (err) {
//       console.error("Download error:", err);
//       alert("Failed to download chart. Please try again.");
//     }
//   };

//   if (!finalResult) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="text-center bg-white rounded-3xl p-12 shadow-xl max-w-md"
//         >
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Results Available</h2>
//           <p className="text-gray-600 mb-6">Please complete the assessment first to view your results.</p>
//           <button
//             onClick={onStartNew}
//             className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
//           >
//             Start Assessment
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   const { finalJSON, prediction, probability, shap_values } = finalResult;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-pink-50/30 relative overflow-hidden">
//       {/* Animated background blobs */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 -left-32 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
//         <div className="absolute top-40 -right-32 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//         <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-12"
//         >
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg mb-6">
//             <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
//             </svg>
//           </div>
//           <h1 className="text-5xl font-semibold text-gray-900 mb-3">
//             Your Heart Health Analysis
//           </h1>
//           <p className="text-xl text-gray-600">AI-powered coronary heart disease risk assessment</p>
//         </motion.div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//           {/* Left Column - Risk Score & Input Summary */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* Risk Score Card */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.1 }}
//               className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8"
//             >
//               <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Risk Assessment</h2>
//               <RiskGauge probability={probability ?? 0} />
//               <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-200">
//                 <p className="text-xs text-gray-600 text-center leading-relaxed">
//                   Based on your health data and medical history, our AI model has calculated your coronary heart disease risk probability.
//                 </p>
//               </div>
//             </motion.div>

//             {/* Input Summary */}
//             <InputSummaryCard finalJSON={finalJSON} />
//           </div>

//           {/* Right Column - SHAP Explanation */}
//           <div className="lg:col-span-2">
//             <motion.div
//               ref={chartRef}
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2 }}
//               className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
//             >
//               {/* Chart Header */}
//               <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-2xl font-semibold text-white mb-1 flex items-center gap-2">
//                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                       </svg>
//                       Feature Contribution Analysis
//                     </h2>
//                     <p className="text-indigo-100 text-sm">Understanding what influences your risk</p>
//                   </div>
//                   <button
//                     onClick={handleDownloadPNG}
//                     className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium"
//                   >
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                     </svg>
//                     Download
//                   </button>
//                 </div>
//               </div>

//               {/* Legend */}
//               <div className="px-8 py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
//                 <div className="flex items-center justify-center gap-8 text-sm">
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-rose-600"></div>
//                     <span className="text-gray-700 font-medium">Increases Risk</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-sky-400"></div>
//                     <span className="text-gray-700 font-medium">Decreases Risk</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Chart */}
//               <div className="p-8">
//                 {shap_values ? (
//                   <EnhancedShapChart
//                     shapValues={shap_values}
//                     featureValues={finalJSON}
//                     topN={12}
//                   />
//                 ) : (
//                   <div className="flex items-center justify-center h-64">
//                     <p className="text-gray-500">No explainability data available</p>
//                   </div>
//                 )}
//               </div>

//               {/* Info Box */}
//               <div className="px-8 pb-8">
//                 <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
//                   <div className="flex gap-4">
//                     <div className="flex-shrink-0">
//                       <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h4 className="text-sm font-semibold text-blue-900 mb-1">How to read this chart</h4>
//                       <p className="text-sm text-blue-800 leading-relaxed">
//                         Each bar shows how much a specific factor contributes to your risk. Red bars indicate factors that increase your risk, while blue bars show factors that decrease it. Hover over any bar for detailed information.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Dive Deeper Button */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="mt-6"
//             >
//               <button
//                 onClick={() => setShowDiveDeeper(true)}
//                 className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
//               >
//                 <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                 </svg>
//                 Dive Deeper • Get Personalized Recommendations
//                 <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                 </svg>
//               </button>
//             </motion.div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//           className="flex items-center justify-center gap-4"
//         >
//           <button
//             onClick={onStartNew}
//             className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
//           >
//             Start New Assessment
//           </button>
//         </motion.div>

//         {/* Disclaimer */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.6 }}
//           className="mt-12 text-center"
//         >
//           <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-200 shadow-sm">
//             <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
//               <strong className="text-gray-900">Medical Disclaimer:</strong> This assessment provides an informational risk estimate based on AI analysis and is not a medical diagnosis. Always consult with a qualified healthcare provider for medical advice, diagnosis, and treatment decisions.
//             </p>
//           </div>
//         </motion.div>
//       </div>

//       {/* Dive Deeper Modal Placeholder */}
//       <AnimatePresence>
//         {showDiveDeeper && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
//             onClick={() => setShowDiveDeeper(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8"
//             >
//               <div className="text-center">
//                 <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3."/>
// <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
//                 <p className="text-gray-600 mb-6">
//                   Personalized health recommendations and lifestyle improvement suggestions will be available here.
//                 </p>
//                 <button
//                   onClick={() => setShowDiveDeeper(false)}
//                   className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <style jsx>{`
//         @keyframes blob {
//           0%, 100% {
//             transform: translate(0, 0) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//         }

//         .animate-blob {
//           animation: blob 7s infinite;
//         }

//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }

//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//       `}</style>
//     </div>
//   );
// }
// src/screens/ResultScreen.jsx
// src/screens/ResultScreen.jsx
import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

// Import HealthChatBot component
import HealthChatBot from "./Healthchatbot";

// Enhanced SHAP Chart Component
const EnhancedShapChart = ({ shapValues, featureValues, topN = 12 }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

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
    chol_bmi_ratio: "Cholesterol/BMI Ratio",
    age_glucose_interaction: "Age × Glucose",
    bpmeds_hyp: "BP Meds × Hypertension",
    smoker_intensity: "Smoking Intensity",
    male: "Gender (Male)",
    BPMeds: "BP Medication",
    prevalentStroke: "Previous Stroke",
    prevalentHyp: "Hypertension",
    diabetes: "Diabetes",
  };

  const humanize = (name) => featureNameMap[name] || name;

  const data = React.useMemo(() => {
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

  return (
    <div className="w-full" style={{ height: Math.max(500, data.length * 42) }}>
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
            dataKey="shap" 
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
  );
};

// Risk Gauge Component
const RiskGauge = ({ probability }) => {
  const percentage = Math.round(probability * 100);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getRiskData = (p) => {
    if (p >= 0.5) return { 
      label: "High Risk", 
      color: "#ef4444",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
      gradient: "from-red-500 to-rose-600"
    };
    if (p >= 0.2) return { 
      label: "Moderate Risk", 
      color: "#f59e0b",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
      gradient: "from-amber-500 to-orange-600"
    };
    return { 
      label: "Low Risk", 
      color: "#10b981",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200",
      gradient: "from-green-500 to-emerald-600"
    };
  };

  const risk = getRiskData(probability);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="relative flex flex-col items-center justify-center"
    >
      <svg width="240" height="240" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="120"
          cy="120"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="16"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="120"
          cy="120"
          r={radius}
          stroke={risk.color}
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          style={{
            filter: `drop-shadow(0 0 8px ${risk.color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <div className="text-5xl font-bold text-gray-900 mb-1">{percentage}%</div>
          <div className={`text-sm font-semibold ${risk.textColor}`}>{risk.label}</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Input Summary Card
const InputSummaryCard = ({ finalJSON }) => {
  const categories = {
    "Personal": ["age", "male", "BMI"],
    "Lifestyle": ["currentSmoker", "cigsPerDay"],
    "Medical History": ["diabetes", "prevalentStroke", "prevalentHyp", "BPMeds"],
    "Vitals": ["sysBP", "diaBP", "totChol", "glucose"]
  };

  const labelMap = {
    age: "Age",
    male: "Gender",
    BMI: "BMI",
    currentSmoker: "Current Smoker",
    cigsPerDay: "Cigarettes/Day",
    diabetes: "Diabetes",
    prevalentStroke: "Previous Stroke",
    prevalentHyp: "Hypertension",
    BPMeds: "BP Medication",
    sysBP: "Systolic BP",
    diaBP: "Diastolic BP",
    totChol: "Total Cholesterol",
    glucose: "Blood Glucose"
  };

  const formatValue = (key, value) => {
    if (key === "male") return value === 1 ? "Male" : "Female";
    if (["currentSmoker", "diabetes", "prevalentStroke", "prevalentHyp", "BPMeds"].includes(key)) {
      return value === 1 ? "Yes" : "No";
    }
    if (typeof value === "number") return value.toFixed(1);
    return value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Your Assessment Data
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {Object.entries(categories).map(([category, keys]) => (
          <div key={category}>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{category}</h4>
            <div className="grid grid-cols-2 gap-3">
              {keys.map((key) => (
                finalJSON[key] !== undefined && (
                  <div key={key} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">{labelMap[key] || key}</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatValue(key, finalJSON[key])}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function ResultScreen({ finalResult, onStartNew }) {
  const chartRef = useRef(null);
  const [showDiveDeeper, setShowDiveDeeper] = useState(false);

  const handleDownloadPNG = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `heart-health-analysis-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download chart. Please try again.");
    }
  };

  if (!finalResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-3xl p-12 shadow-xl max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Results Available</h2>
          <p className="text-gray-600 mb-6">Please complete the assessment first to view your results.</p>
          <button
            onClick={onStartNew}
            className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Start Assessment
          </button>
        </motion.div>
      </div>
    );
  }

  const { finalJSON, prediction, probability, shap_values } = finalResult;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-pink-50/30 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-32 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg mb-6">
            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1 className="text-5xl font-semibold text-gray-900 mb-3">
            Your Heart Health Analysis
          </h1>
          <p className="text-xl text-gray-600">AI-powered coronary heart disease risk assessment</p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Risk Score & Input Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Risk Score Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Risk Assessment</h2>
              <RiskGauge probability={probability ?? 0} />
              <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  Based on your health data and medical history, our AI model has calculated your coronary heart disease risk probability.
                </p>
              </div>
            </motion.div>

            {/* Input Summary */}
            <InputSummaryCard finalJSON={finalJSON} />
          </div>

          {/* Right Column - SHAP Explanation */}
          <div className="lg:col-span-2">
            <motion.div
              ref={chartRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
            >
              {/* Chart Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Feature Contribution Analysis
                    </h2>
                    <p className="text-indigo-100 text-sm">Understanding what influences your risk</p>
                  </div>
                  <button
                    onClick={handleDownloadPNG}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="px-8 py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-rose-600"></div>
                    <span className="text-gray-700 font-medium">Increases Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-sky-400"></div>
                    <span className="text-gray-700 font-medium">Decreases Risk</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="p-8">
                {shap_values ? (
                  <EnhancedShapChart
                    shapValues={shap_values}
                    featureValues={finalJSON}
                    topN={12}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No explainability data available</p>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="px-8 pb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">How to read this chart</h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        Each bar shows how much a specific factor contributes to your risk. Red bars indicate factors that increase your risk, while blue bars show factors that decrease it. Hover over any bar for detailed information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dive Deeper Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <button
                onClick={() => setShowDiveDeeper(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Dive Deeper • Get Personalized Recommendations
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={onStartNew}
            className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
          >
            Start New Assessment
          </button>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
              <strong className="text-gray-900">Medical Disclaimer:</strong> This assessment provides an informational risk estimate based on AI analysis and is not a medical diagnosis. Always consult with a qualified healthcare provider for medical advice, diagnosis, and treatment decisions.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Health ChatBot */}
      <HealthChatBot 
        isOpen={showDiveDeeper}
        onClose={() => setShowDiveDeeper(false)}
        userData={finalJSON}
        shapValues={shap_values}
        probability={probability}
      />
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}