// src/components/Screen2.jsx
import { useState, useEffect } from "react";
import { saveToFirebase, getFromFirebase } from "../utils/firebasestorage";
import { getSessionId } from "../utils/sessionManager";

const Screen2 = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    bp_meds: "",
    prevalent_stroke: "",
    prevalent_hyp: "",
    systolic_bp: "",
    diastolic_bp: ""
  });
  const [loading, setLoading] = useState(false);
  const sessionId = getSessionId();

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getFromFirebase(sessionId, "advancedDetails");
        if (saved) {
          setFormData(saved);
        }
      } catch (err) {
        console.error("Screen2 load error:", err);
      }
    };
    loadData();
  }, [sessionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bp_meds || !formData.prevalent_stroke || !formData.prevalent_hyp || !formData.systolic_bp || !formData.diastolic_bp) {
      alert("Please fill in all required fields");
      return;
    }

    const systolic = parseInt(formData.systolic_bp);
    const diastolic = parseInt(formData.diastolic_bp);

    if (systolic < 50 || systolic > 250) {
      alert("Please enter a valid systolic blood pressure (50-250)");
      return;
    }

    if (diastolic < 30 || diastolic > 150) {
      alert("Please enter a valid diastolic blood pressure (30-150)");
      return;
    }

    if (diastolic >= systolic) {
      alert("Diastolic BP must be less than Systolic BP");
      return;
    }

    setLoading(true);

    try {
      await saveToFirebase(sessionId, "advancedDetails", formData);
      setLoading(false);
      onNext();
    } catch (error) {
      setLoading(false);
      console.error("Screen2 save error:", error);
      alert("Error saving data. Please try again.");
    }
  };

  const getBPStatus = (systolic, diastolic) => {
    if (!systolic || !diastolic) return null;
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);

    if (sys < 120 && dia < 80) return { text: "Normal", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (sys < 130 && dia < 80) return { text: "Elevated", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    if (sys < 140 || dia < 90) return { text: "High Stage 1", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    if (sys < 180 || dia < 120) return { text: "High Stage 2", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    return { text: "Hypertensive Crisis", color: "text-red-700", bg: "bg-red-100", border: "border-red-300" };
  };

  const bpStatus = getBPStatus(formData.systolic_bp, formData.diastolic_bp);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 text-white font-bold text-lg mb-4">2</div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Medical History</h1>
          <p className="text-gray-600">Step 2 of 3 • Health conditions</p>
          <div className="mt-6 w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
            <div className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" style={{ width: "66%" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Medical conditions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">BP Medication <span className="text-red-500">*</span></label>
                  <select name="bp_meds" value={formData.bp_meds} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Previous Stroke <span className="text-red-500">*</span></label>
                  <select name="prevalent_stroke" value={formData.prevalent_stroke} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Hypertension <span className="text-red-500">*</span></label>
                  <select name="prevalent_hyp" value={formData.prevalent_hyp} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required>
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
                <p className="text-sm text-blue-900">Enter your blood pressure as <strong>120/80</strong> where <strong>120</strong> is systolic and <strong>80</strong> is diastolic.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Systolic BP <span className="text-red-500">*</span></label>
                  <input type="number" name="systolic_bp" value={formData.systolic_bp} onChange={handleChange} placeholder="120" className="w-full px-4 py-3 border border-gray-300 rounded-xl" required min="50" max="250" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Diastolic BP <span className="text-red-500">*</span></label>
                  <input type="number" name="diastolic_bp" value={formData.diastolic_bp} onChange={handleChange} placeholder="80" className="w-full px-4 py-3 border border-gray-300 rounded-xl" required min="30" max="150" />
                </div>
              </div>

              {bpStatus && (
                <div className={`mt-4 p-4 rounded-xl border ${bpStatus.border} ${bpStatus.bg}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">BP Status:</span>
                    <span className={`font-semibold ${bpStatus.color}`}>{formData.systolic_bp}/{formData.diastolic_bp} • {bpStatus.text}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" onClick={onBack} className="px-8 py-3 bg-gray-100 rounded-full">Back</button>
              <button type="submit" disabled={loading} className="px-8 py-3 bg-gray-900 text-white rounded-full">{loading ? "Saving..." : "Continue"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Screen2;
