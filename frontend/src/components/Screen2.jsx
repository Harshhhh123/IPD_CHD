// import { useState, useEffect } from 'react';
// import { saveToStorage, getFromStorage } from '../utils/storage';

// const Screen2 = ({ onNext, onBack }) => {
//   const [formData, setFormData] = useState({
//     bp_meds: '',
//     prevalent_stroke: '',
//     prevalent_hyp: '',
//     systolic_bp: '',
//     diastolic_bp: ''
//   });

//   useEffect(() => {
//     const saved = getFromStorage('chd_advanced_details');
//     if (saved) {
//       setFormData(saved);
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!formData.bp_meds || !formData.prevalent_stroke || !formData.prevalent_hyp ||
//         !formData.systolic_bp || !formData.diastolic_bp) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     const systolic = parseInt(formData.systolic_bp);
//     const diastolic = parseInt(formData.diastolic_bp);
    
//     if (systolic < 50 || systolic > 250) {
//       alert('Please enter a valid systolic blood pressure (50-250)');
//       return;
//     }
    
//     if (diastolic < 30 || diastolic > 150) {
//       alert('Please enter a valid diastolic blood pressure (30-150)');
//       return;
//     }

//     if (diastolic >= systolic) {
//       alert('Diastolic BP must be less than Systolic BP');
//       return;
//     }

//     saveToStorage('chd_advanced_details', formData);
//     onNext();
//   };

//   const getBPStatus = (systolic, diastolic) => {
//     if (!systolic || !diastolic) return null;
//     const sys = parseInt(systolic);
//     const dia = parseInt(diastolic);
    
//     if (sys < 120 && dia < 80) return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
//     if (sys < 130 && dia < 80) return { text: 'Elevated', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
//     if (sys < 140 || dia < 90) return { text: 'High Stage 1', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
//     if (sys < 180 || dia < 120) return { text: 'High Stage 2', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
//     return { text: 'Hypertensive Crisis', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' };
//   };

//   const bpStatus = getBPStatus(formData.systolic_bp, formData.diastolic_bp);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-4xl">
//         {/* Header Card */}
//         <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 mb-2">Medical History</h1>
//               <p className="text-gray-600">Step 2 of 3 - Advanced details</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                 2
//               </div>
//             </div>
//           </div>
//           <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//             <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500" style={{ width: '66%' }}></div>
//           </div>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-8">
//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* Medical History Section */}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 Medical History
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     BP Medication <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="bp_meds"
//                     value={formData.bp_meds}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white"
//                     required
//                   >
//                     <option value="">Select option</option>
//                     <option value="yes">Yes</option>
//                     <option value="no">No</option>
//                   </select>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Prevalent Stroke <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="prevalent_stroke"
//                     value={formData.prevalent_stroke}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white"
//                     required
//                   >
//                     <option value="">Select option</option>
//                     <option value="yes">Yes</option>
//                     <option value="no">No</option>
//                   </select>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Hypertension <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="prevalent_hyp"
//                     value={formData.prevalent_hyp}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white"
//                     required
//                   >
//                     <option value="">Select option</option>
//                     <option value="yes">Yes</option>
//                     <option value="no">No</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Blood Pressure Section */}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//                 Blood Pressure
//               </h2>
              
//               <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
//                 <div className="flex items-start gap-3">
//                   <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                   </svg>
//                   <div>
//                     <p className="text-sm font-medium text-blue-800 mb-1">Blood Pressure Format</p>
//                     <p className="text-sm text-blue-700">
//                       Enter your blood pressure as <strong>120/80 mmHg</strong> where <strong>120</strong> is systolic (top number) 
//                       and <strong>80</strong> is diastolic (bottom number).
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Systolic BP (mmHg) <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="number"
//                       name="systolic_bp"
//                       value={formData.systolic_bp}
//                       onChange={handleChange}
//                       placeholder="e.g., 120"
//                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white"
//                       required
//                       min="50"
//                       max="250"
//                     />
//                     <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">mmHg</span>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">
//                     Diastolic BP (mmHg) <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="number"
//                       name="diastolic_bp"
//                       value={formData.diastolic_bp}
//                       onChange={handleChange}
//                       placeholder="e.g., 80"
//                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white"
//                       required
//                       min="30"
//                       max="150"
//                     />
//                     <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">mmHg</span>
//                   </div>
//                 </div>
//               </div>

//               {bpStatus && (
//                 <div className={`mt-4 p-4 rounded-xl border-2 ${bpStatus.border} ${bpStatus.bg}`}>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-medium text-gray-700">BP Status:</span>
//                     <span className={`text-lg font-bold ${bpStatus.color}`}>
//                       {formData.systolic_bp}/{formData.diastolic_bp} - {bpStatus.text}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>

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
//                 className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
//               >
//                 Continue
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Screen2;
import { useState, useEffect } from 'react';
import { saveToFirebase, getFromFirebase } from '../utils/firebasestorage';
import { getSessionId } from '../utils/sessionManager';

const Screen2 = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    bp_meds: '',
    prevalent_stroke: '',
    prevalent_hyp: '',
    systolic_bp: '',
    diastolic_bp: ''
  });
  const [loading, setLoading] = useState(false);
  const sessionId = getSessionId();

  useEffect(() => {
    const loadData = async () => {
      const saved = await getFromFirebase(sessionId, 'advancedDetails');
      if (saved) {
        setFormData(saved);
      }
    };
    loadData();
  }, [sessionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bp_meds || !formData.prevalent_stroke || !formData.prevalent_hyp ||
        !formData.systolic_bp || !formData.diastolic_bp) {
      alert('Please fill in all required fields');
      return;
    }

    const systolic = parseInt(formData.systolic_bp);
    const diastolic = parseInt(formData.diastolic_bp);
    
    if (systolic < 50 || systolic > 250) {
      alert('Please enter a valid systolic blood pressure (50-250)');
      return;
    }
    
    if (diastolic < 30 || diastolic > 150) {
      alert('Please enter a valid diastolic blood pressure (30-150)');
      return;
    }

    if (diastolic >= systolic) {
      alert('Diastolic BP must be less than Systolic BP');
      return;
    }

    setLoading(true);
    
    try {
      await saveToFirebase(sessionId, 'advancedDetails', formData);
      setLoading(false);
      onNext();
    } catch (error) {
      setLoading(false);
      alert('Error saving data. Please try again.');
    }
  };

  const getBPStatus = (systolic, diastolic) => {
    if (!systolic || !diastolic) return null;
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    
    if (sys < 120 && dia < 80) return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (sys < 130 && dia < 80) return { text: 'Elevated', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (sys < 140 || dia < 90) return { text: 'High Stage 1', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (sys < 180 || dia < 120) return { text: 'High Stage 2', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    return { text: 'Hypertensive Crisis', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' };
  };

  const bpStatus = getBPStatus(formData.systolic_bp, formData.diastolic_bp);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 text-white font-bold text-lg mb-4">
            2
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Medical History</h1>
          <p className="text-gray-600">Step 2 of 3 • Health conditions</p>
          
          {/* Progress Bar */}
          <div className="mt-6 w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
            <div className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Medical Conditions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    BP Medication <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bp_meds"
                    value={formData.bp_meds}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                    required
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Previous Stroke <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="prevalent_stroke"
                    value={formData.prevalent_stroke}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                    required
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Hypertension <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="prevalent_hyp"
                    value={formData.prevalent_hyp}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                    required
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Blood Pressure */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Pressure</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-900">
                  Enter your blood pressure as <strong>120/80</strong> where <strong>120</strong> is systolic (top number) 
                  and <strong>80</strong> is diastolic (bottom number).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Systolic BP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="systolic_bp"
                    value={formData.systolic_bp}
                    onChange={handleChange}
                    placeholder="120"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                    required
                    min="50"
                    max="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Diastolic BP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="diastolic_bp"
                    value={formData.diastolic_bp}
                    onChange={handleChange}
                    placeholder="80"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                    required
                    min="30"
                    max="150"
                  />
                </div>
              </div>

              {bpStatus && (
                <div className={`mt-4 p-4 rounded-xl border ${bpStatus.border} ${bpStatus.bg}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">BP Status:</span>
                    <span className={`font-semibold ${bpStatus.color}`}>
                      {formData.systolic_bp}/{formData.diastolic_bp} • {bpStatus.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

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
                disabled={loading}
                className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Screen2;