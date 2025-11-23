// import { useState, useEffect } from 'react';
// import { saveToStorage, getFromStorage, generateFinalJSON } from '../utils/firebaseStorage';
// import { extractCholesterolWithGemini, extractGlucoseWithGemini } from '../utils/geminiExtraction';
// import { checkGeminiAPIKey } from '../utils/debugEnv';

// const Screen3 = ({ onBack }) => {
//   const [formData, setFormData] = useState({
//     total_cholesterol: '',
//     glucose: ''
//   });

//   const [lipidFile, setLipidFile] = useState(null);
//   const [bloodSugarFile, setBloodSugarFile] = useState(null);
//   const [processing, setProcessing] = useState(false);
//   const [ocrResults, setOcrResults] = useState({ cholesterol: null, glucose: null });

//   useEffect(() => {
//     checkGeminiAPIKey();
    
//     const saved = getFromStorage('chd_medical_reports');
//     if (saved) {
//       setFormData(saved);
//       if (saved.total_cholesterol) setOcrResults(prev => ({ ...prev, cholesterol: saved.total_cholesterol }));
//       if (saved.glucose) setOcrResults(prev => ({ ...prev, glucose: saved.glucose }));
//     }
//   }, []);

//   const handleManualInput = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleLipidProfileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert('Please upload an image file');
//       return;
//     }

//     setLipidFile(file);
//     setProcessing(true);

//     try {
//       const { cholesterol } = await extractCholesterolWithGemini(file);
//       if (cholesterol) {
//         setFormData(prev => ({ ...prev, total_cholesterol: cholesterol.toString() }));
//         setOcrResults(prev => ({ ...prev, cholesterol }));
//         saveToStorage('chd_medical_reports', { ...formData, total_cholesterol: cholesterol.toString() });
//         alert(`Cholesterol value extracted: ${cholesterol} mg/dL`);
//       } else {
//         alert('Could not extract cholesterol value. Please enter manually.');
//       }
//     } catch (error) {
//       console.error('Error processing lipid profile:', error);
//       alert(`Error: ${error.message}. Please try again or enter manually.`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleBloodSugarUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert('Please upload an image file');
//       return;
//     }

//     setBloodSugarFile(file);
//     setProcessing(true);

//     try {
//       const { glucose } = await extractGlucoseWithGemini(file);
//       if (glucose) {
//         setFormData(prev => ({ ...prev, glucose: glucose.toString() }));
//         setOcrResults(prev => ({ ...prev, glucose }));
//         saveToStorage('chd_medical_reports', { ...formData, glucose: glucose.toString() });
//         alert(`Glucose value extracted: ${glucose} mg/dL`);
//       } else {
//         alert('Could not extract glucose value. Please enter manually.');
//       }
//     } catch (error) {
//       console.error('Error processing blood sugar test:', error);
//       alert(`Error: ${error.message}. Please try again or enter manually.`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!formData.total_cholesterol || !formData.glucose) {
//       alert('Please provide cholesterol and glucose values (either via upload or manual entry)');
//       return;
//     }

//     const cholesterol = parseFloat(formData.total_cholesterol);
//     const glucose = parseFloat(formData.glucose);

//     if (isNaN(cholesterol) || cholesterol < 0 || cholesterol > 500) {
//       alert('Please enter a valid cholesterol value (0-500 mg/dL)');
//       return;
//     }

//     if (isNaN(glucose) || glucose < 0 || glucose > 500) {
//       alert('Please enter a valid glucose value (0-500 mg/dL)');
//       return;
//     }

//     saveToStorage('chd_medical_reports', formData);
//     const finalJSON = generateFinalJSON();
    
//     alert('All information saved successfully! Check console for final JSON.');
//     console.log('=== FINAL 12-FEATURE JSON FOR ML MODEL ===');
//     console.log(JSON.stringify(finalJSON, null, 2));
//   };

//   const getCholesterolStatus = (value) => {
//     if (!value) return null;
//     const val = parseFloat(value);
//     if (val < 200) return { text: 'Desirable', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
//     if (val < 240) return { text: 'Borderline High', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
//     return { text: 'High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
//   };

//   const getGlucoseStatus = (value) => {
//     if (!value) return null;
//     const val = parseFloat(value);
//     if (val < 100) return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
//     if (val < 126) return { text: 'Prediabetes', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
//     return { text: 'Diabetes', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
//   };

//   const cholStatus = getCholesterolStatus(formData.total_cholesterol);
//   const glucoseStatus = getGlucoseStatus(formData.glucose);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-4xl">
//         {/* Header Card */}
//         <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 mb-2">Medical Reports</h1>
//               <p className="text-gray-600">Step 3 of 3 - Upload test reports</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                 3
//               </div>
//             </div>
//           </div>
//           <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//             <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
//           </div>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-8">
//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* Lipid Profile Section */}
//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-800">Lipid Profile Test</h3>
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3">
//                   Upload Lipid Profile Report (AI will extract Total Cholesterol)
//                 </label>
//                 <label className="block cursor-pointer">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleLipidProfileUpload}
//                     className="hidden"
//                     disabled={processing}
//                   />
//                   <div className="px-6 py-8 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 text-center group">
//                     {lipidFile ? (
//                       <div className="space-y-2">
//                         <svg className="w-12 h-12 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <p className="text-green-600 font-medium">{lipidFile.name}</p>
//                         <p className="text-xs text-gray-500">Click to change file</p>
//                       </div>
//                     ) : (
//                       <div className="space-y-2">
//                         <svg className="w-12 h-12 text-blue-400 mx-auto group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                         </svg>
//                         <p className="text-gray-600 font-medium">Click to upload image</p>
//                         <p className="text-xs text-gray-400">PNG, JPG, or PDF</p>
//                       </div>
//                     )}
//                   </div>
//                 </label>
//                 {ocrResults.cholesterol && (
//                   <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                     <p className="text-sm text-green-700 font-medium">
//                       ✓ AI Extracted: <span className="font-bold">{ocrResults.cholesterol} mg/dL</span>
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex items-center gap-4 my-4">
//                 <div className="flex-1 border-t border-gray-300"></div>
//                 <span className="text-sm font-medium text-gray-500">OR</span>
//                 <div className="flex-1 border-t border-gray-300"></div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Total Cholesterol (mg/dL) <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="number"
//                     name="total_cholesterol"
//                     value={formData.total_cholesterol}
//                     onChange={handleManualInput}
//                     placeholder="Enter total cholesterol value"
//                     className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
//                     required
//                     min="0"
//                     max="500"
//                     step="0.1"
//                   />
//                   <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">mg/dL</span>
//                 </div>
//                 {cholStatus && (
//                   <div className={`mt-2 p-3 rounded-lg border-2 ${cholStatus.border} ${cholStatus.bg}`}>
//                     <span className={`text-sm font-bold ${cholStatus.color}`}>
//                       Status: {cholStatus.text}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Blood Sugar Test Section */}
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-100">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-800">Blood Sugar Test (Fasting)</h3>
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3">
//                   Upload Blood Sugar Test Report (AI will extract Fasting Glucose)
//                 </label>
//                 <label className="block cursor-pointer">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleBloodSugarUpload}
//                     className="hidden"
//                     disabled={processing}
//                   />
//                   <div className="px-6 py-8 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 text-center group">
//                     {bloodSugarFile ? (
//                       <div className="space-y-2">
//                         <svg className="w-12 h-12 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <p className="text-green-600 font-medium">{bloodSugarFile.name}</p>
//                         <p className="text-xs text-gray-500">Click to change file</p>
//                       </div>
//                     ) : (
//                       <div className="space-y-2">
//                         <svg className="w-12 h-12 text-purple-400 mx-auto group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                         </svg>
//                         <p className="text-gray-600 font-medium">Click to upload image</p>
//                         <p className="text-xs text-gray-400">PNG, JPG, or PDF</p>
//                       </div>
//                     )}
//                   </div>
//                 </label>
//                 {ocrResults.glucose && (
//                   <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                     <p className="text-sm text-green-700 font-medium">
//                       ✓ AI Extracted: <span className="font-bold">{ocrResults.glucose} mg/dL</span>
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex items-center gap-4 my-4">
//                 <div className="flex-1 border-t border-gray-300"></div>
//                 <span className="text-sm font-medium text-gray-500">OR</span>
//                 <div className="flex-1 border-t border-gray-300"></div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Fasting Glucose (mg/dL) <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="number"
//                     name="glucose"
//                     value={formData.glucose}
//                     onChange={handleManualInput}
//                     placeholder="Enter fasting glucose value"
//                     className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white"
//                     required
//                     min="0"
//                     max="500"
//                     step="0.1"
//                   />
//                   <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">mg/dL</span>
//                 </div>
//                 {glucoseStatus && (
//                   <div className={`mt-2 p-3 rounded-lg border-2 ${glucoseStatus.border} ${glucoseStatus.bg}`}>
//                     <span className={`text-sm font-bold ${glucoseStatus.color}`}>
//                       Status: {glucoseStatus.text}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Processing Indicator */}
//             {processing && (
//               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
//                 <div className="flex items-center justify-center gap-3">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                   <p className="text-blue-800 font-medium">
//                     Processing with AI... Please wait
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Buttons */}
//             <div className="flex justify-between pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={onBack}
//                 className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//                 Back
//               </button>
//               <button
//                 type="submit"
//                 disabled={processing}
//                 className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 Complete Assessment
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Screen3;

import { useState, useEffect } from 'react';
import { saveToFirebase, getFromFirebase, generateFinalJSON } from '../utils/firebasestorage';
import { getSessionId } from '../utils/sessionManager';
import { extractCholesterolWithGemini, extractGlucoseWithGemini } from '../utils/geminiExtraction';

const Screen3 = ({ onBack, onComplete }) => {
  const [formData, setFormData] = useState({
    total_cholesterol: '',
    glucose: ''
  });

  const [lipidFile, setLipidFile] = useState(null);
  const [bloodSugarFile, setBloodSugarFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState({ cholesterol: null, glucose: null });
  const [loading, setLoading] = useState(false);
  const sessionId = getSessionId();

  useEffect(() => {
    const loadData = async () => {
      const saved = await getFromFirebase(sessionId, 'medicalReports');
      if (saved) {
        setFormData(saved);
        if (saved.total_cholesterol) setOcrResults(prev => ({ ...prev, cholesterol: saved.total_cholesterol }));
        if (saved.glucose) setOcrResults(prev => ({ ...prev, glucose: saved.glucose }));
      }
    };
    loadData();
  }, [sessionId]);

  const handleManualInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLipidProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setLipidFile(file);
    setProcessing(true);

    try {
      const { cholesterol } = await extractCholesterolWithGemini(file);
      if (cholesterol) {
        setFormData(prev => ({ ...prev, total_cholesterol: cholesterol.toString() }));
        setOcrResults(prev => ({ ...prev, cholesterol }));
        alert(`✅ Cholesterol extracted: ${cholesterol} mg/dL`);
      } else {
        alert('Could not extract cholesterol. Please enter manually.');
      }
    } catch (error) {
      console.error('Error processing lipid profile:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBloodSugarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setBloodSugarFile(file);
    setProcessing(true);

    try {
      const { glucose } = await extractGlucoseWithGemini(file);
      if (glucose) {
        setFormData(prev => ({ ...prev, glucose: glucose.toString() }));
        setOcrResults(prev => ({ ...prev, glucose }));
        alert(`✅ Glucose extracted: ${glucose} mg/dL`);
      } else {
        alert('Could not extract glucose. Please enter manually.');
      }
    } catch (error) {
      console.error('Error processing blood sugar test:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.total_cholesterol || !formData.glucose) {
      alert('Please provide cholesterol and glucose values');
      return;
    }

    const cholesterol = parseFloat(formData.total_cholesterol);
    const glucose = parseFloat(formData.glucose);

    if (isNaN(cholesterol) || cholesterol < 0 || cholesterol > 500) {
      alert('Please enter a valid cholesterol value (0-500 mg/dL)');
      return;
    }

    if (isNaN(glucose) || glucose < 0 || glucose > 500) {
      alert('Please enter a valid glucose value (0-500 mg/dL)');
      return;
    }

    setLoading(true);

    try {
      await saveToFirebase(sessionId, 'medicalReports', formData);
      const finalJSON = await generateFinalJSON(sessionId);
      
      setLoading(false);
      
      // Navigate to results screen
      if (onComplete) {
        onComplete(finalJSON);
      }
    } catch (error) {
      setLoading(false);
      alert('Error saving data. Please try again.');
    }
  };

  const getCholesterolStatus = (value) => {
    if (!value) return null;
    const val = parseFloat(value);
    if (val < 200) return { text: 'Desirable', color: 'text-green-600' };
    if (val < 240) return { text: 'Borderline High', color: 'text-yellow-600' };
    return { text: 'High', color: 'text-red-600' };
  };

  const getGlucoseStatus = (value) => {
    if (!value) return null;
    const val = parseFloat(value);
    if (val < 100) return { text: 'Normal', color: 'text-green-600' };
    if (val < 126) return { text: 'Prediabetes', color: 'text-yellow-600' };
    return { text: 'Diabetes', color: 'text-red-600' };
  };

  const cholStatus = getCholesterolStatus(formData.total_cholesterol);
  const glucoseStatus = getGlucoseStatus(formData.glucose);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 text-white font-bold text-lg mb-4">
            3
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Medical Reports</h1>
          <p className="text-gray-600">Step 3 of 3 • Upload or enter values</p>
          
          {/* Progress Bar */}
          <div className="mt-6 w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
            <div className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Lipid Profile */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lipid Profile Test</h2>
              
              <label className="block mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLipidProfileUpload}
                  className="hidden"
                  disabled={processing}
                />
                <div className="px-6 py-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-center cursor-pointer">
                  {lipidFile ? (
                    <div className="space-y-2">
                      <svg className="w-10 h-10 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-green-600 font-medium text-sm">{lipidFile.name}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-700 font-medium text-sm">Upload Lipid Profile</p>
                      <p className="text-xs text-gray-500">PNG, JPG (AI will extract cholesterol)</p>
                    </div>
                  )}
                </div>
              </label>

              {ocrResults.cholesterol && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ AI Extracted: <span className="font-bold">{ocrResults.cholesterol} mg/dL</span>
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-xs font-medium text-gray-500">OR ENTER MANUALLY</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Total Cholesterol (mg/dL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="total_cholesterol"
                  value={formData.total_cholesterol}
                  onChange={handleManualInput}
                  placeholder="200"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                  required
                  min="0"
                  max="500"
                  step="0.1"
                />
                {cholStatus && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ${cholStatus.color}`}>
                        {cholStatus.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Blood Sugar Test */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Sugar Test (Fasting)</h2>
              
              <label className="block mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBloodSugarUpload}
                  className="hidden"
                  disabled={processing}
                />
                <div className="px-6 py-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-center cursor-pointer">
                  {bloodSugarFile ? (
                    <div className="space-y-2">
                      <svg className="w-10 h-10 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-green-600 font-medium text-sm">{bloodSugarFile.name}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-700 font-medium text-sm">Upload Blood Sugar Report</p>
                      <p className="text-xs text-gray-500">PNG, JPG (AI will extract glucose)</p>
                    </div>
                  )}
                </div>
              </label>

              {ocrResults.glucose && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ AI Extracted: <span className="font-bold">{ocrResults.glucose} mg/dL</span>
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-xs font-medium text-gray-500">OR ENTER MANUALLY</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Fasting Glucose (mg/dL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="glucose"
                  value={formData.glucose}
                  onChange={handleManualInput}
                  placeholder="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                  required
                  min="0"
                  max="500"
                  step="0.1"
                />
                {glucoseStatus && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ${glucoseStatus.color}`}>
                        {glucoseStatus.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Indicator */}
            {processing && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-blue-900 font-medium text-sm">
                    AI is processing your report...
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onBack}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full font-medium transition-all duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={processing || loading}
                className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Completing...' : 'Complete Assessment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Screen3;