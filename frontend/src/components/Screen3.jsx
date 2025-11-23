// src/components/Screen3.jsx
import { useState, useEffect } from "react";
import { saveToFirebase, getFromFirebase, generateFinalJSON, getAllDataFromFirebase } from "../utils/firebasestorage";
import { getSessionId } from "../utils/sessionManager";
import { extractCholesterolWithGemini, extractGlucoseWithGemini } from "../utils/geminiExtraction";

const Screen3 = ({ onBack, onComplete }) => {
  const [formData, setFormData] = useState({
    total_cholesterol: "",
    glucose: ""
  });

  const [lipidFile, setLipidFile] = useState(null);
  const [bloodSugarFile, setBloodSugarFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState({ cholesterol: null, glucose: null });
  const [loading, setLoading] = useState(false);
  const sessionId = getSessionId();

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getFromFirebase(sessionId, "medicalReports");
        if (saved) {
          setFormData(saved);
          if (saved.total_cholesterol) setOcrResults((prev) => ({ ...prev, cholesterol: saved.total_cholesterol }));
          if (saved.glucose) setOcrResults((prev) => ({ ...prev, glucose: saved.glucose }));
        }
      } catch (err) {
        console.error("Failed to load saved medicalReports:", err);
      }
    };
    loadData();
  }, [sessionId]);

  const handleManualInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLipidProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setLipidFile(file);
    setProcessing(true);

    try {
      const { cholesterol } = await extractCholesterolWithGemini(file);
      if (cholesterol) {
        setFormData((prev) => ({ ...prev, total_cholesterol: cholesterol.toString() }));
        setOcrResults((prev) => ({ ...prev, cholesterol }));
        alert(`✅ Cholesterol extracted: ${cholesterol} mg/dL`);
      } else {
        alert("Could not extract cholesterol. Please enter manually.");
      }
    } catch (error) {
      console.error("Error processing lipid profile:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBloodSugarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setBloodSugarFile(file);
    setProcessing(true);

    try {
      const { glucose } = await extractGlucoseWithGemini(file);
      if (glucose) {
        setFormData((prev) => ({ ...prev, glucose: glucose.toString() }));
        setOcrResults((prev) => ({ ...prev, glucose }));
        alert(`✅ Glucose extracted: ${glucose} mg/dL`);
      } else {
        alert("Could not extract glucose. Please enter manually.");
      }
    } catch (error) {
      console.error("Error processing blood sugar test:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.total_cholesterol || !formData.glucose) {
      alert("Please provide cholesterol and glucose values");
      return;
    }

    const cholesterol = parseFloat(formData.total_cholesterol);
    const glucose = parseFloat(formData.glucose);

    if (isNaN(cholesterol) || cholesterol < 0 || cholesterol > 500) {
      alert("Please enter a valid cholesterol value (0-500 mg/dL)");
      return;
    }

    if (isNaN(glucose) || glucose < 0 || glucose > 500) {
      alert("Please enter a valid glucose value (0-500 mg/dL)");
      return;
    }

    setLoading(true);

    try {
      // Save medical reports
      await saveToFirebase(sessionId, "medicalReports", formData);

      // generate finalJSON from your helper (expected to return the final features object)
      let finalJSON = null;
      try {
        finalJSON = await generateFinalJSON(sessionId);
      } catch (err) {
        console.warn("generateFinalJSON failed:", err);
      }

      // fallback: if helper didn't return, fetch saved docs and try to find finalJSON
      if (!finalJSON) {
        try {
          const all = await getAllDataFromFirebase(sessionId);
          if (Array.isArray(all) && all.length > 0) {
            // assume helper stored finalJSON in doc or combine fields to create it
            // pick first doc that contains finalJSON
            for (const d of all) {
              if (d.finalJSON) {
                finalJSON = d.finalJSON;
                break;
              }
            }
            // if still null, attempt to create finalJSON from saved collections
            // (This part is minimal — if you want I can implement a full builder)
          }
        } catch (err) {
          console.warn("getAllDataFromFirebase fallback failed:", err);
        }
      }

      if (!finalJSON) {
        // finalJSON couldn't be built — stop and show error
        setLoading(false);
        alert("Could not generate final input JSON for the model. Please retry or contact support.");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      // Now ***send finalJSON to your backend*** predict + explain
     const predictResp = await fetch(`${API_URL}/predict`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(finalJSON),
});

      const predictJson = await predictResp.json();
      if (!predictResp.ok) {
        console.error("Predict error:", predictJson);
        // still proceed, but notify user
        // you might want to handle this more gracefully
      }

      const explainResp = await fetch(`${API_URL}/explain`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(finalJSON),
});
      const explainJson = await explainResp.json();
      if (!explainResp.ok) {
        console.error("Explain error:", explainJson);
      }

      // Build resultObject to pass to onComplete
      const resultObject = {
        finalJSON,
        prediction: predictJson?.prediction ?? null,
        probability: predictJson?.probability ?? null,
        shap_values: explainJson?.shap_values ?? null,
      };

      // call onComplete (App will switch screen)
      if (onComplete) onComplete(resultObject);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Screen3 submit error:", error);
      alert("Error saving data or sending to model. Please try again.");
    }
  };

  const getCholesterolStatus = (value) => {
    if (!value) return null;
    const val = parseFloat(value);
    if (val < 200) return { text: "Desirable", color: "text-green-600" };
    if (val < 240) return { text: "Borderline High", color: "text-yellow-600" };
    return { text: "High", color: "text-red-600" };
  };

  const getGlucoseStatus = (value) => {
    if (!value) return null;
    const val = parseFloat(value);
    if (val < 100) return { text: "Normal", color: "text-green-600" };
    if (val < 126) return { text: "Prediabetes", color: "text-yellow-600" };
    return { text: "Diabetes", color: "text-red-600" };
  };

  const cholStatus = getCholesterolStatus(formData.total_cholesterol);
  const glucoseStatus = getGlucoseStatus(formData.glucose);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 text-white font-bold text-lg mb-4">3</div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Medical Reports</h1>
          <p className="text-gray-600">Step 3 of 3 • Upload or enter values</p>
          <div className="mt-6 w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
            <div className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" style={{ width: "100%" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Lipid Profile */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lipid Profile Test</h2>
              <label className="block mb-4">
                <input type="file" accept="image/*" onChange={handleLipidProfileUpload} className="hidden" disabled={processing} />
                <div className="px-6 py-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-center cursor-pointer">
                  {lipidFile ? (
                    <div className="space-y-2">
                      <p className="text-green-600 font-medium text-sm">{lipidFile.name}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-700 font-medium text-sm">Upload Lipid Profile</p>
                      <p className="text-xs text-gray-500">PNG, JPG (AI will extract cholesterol)</p>
                    </div>
                  )}
                </div>
              </label>

              {ocrResults.cholesterol && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">✓ AI Extracted: <span className="font-bold">{ocrResults.cholesterol} mg/dL</span></p>
                </div>
              )}

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-xs font-medium text-gray-500">OR ENTER MANUALLY</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Total Cholesterol (mg/dL) <span className="text-red-500">*</span></label>
                <input type="number" name="total_cholesterol" value={formData.total_cholesterol} onChange={handleManualInput} placeholder="200" className="w-full px-4 py-3 border border-gray-300 rounded-xl" required min="0" max="500" step="0.1" />
                {cholStatus && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ${cholStatus.color}`}>{cholStatus.text}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Blood Sugar Test */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Sugar Test (Fasting)</h2>
              <label className="block mb-4">
                <input type="file" accept="image/*" onChange={handleBloodSugarUpload} className="hidden" disabled={processing} />
                <div className="px-6 py-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-center cursor-pointer">
                  {bloodSugarFile ? (
                    <div className="space-y-2">
                      <p className="text-green-600 font-medium text-sm">{bloodSugarFile.name}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-700 font-medium text-sm">Upload Blood Sugar Report</p>
                      <p className="text-xs text-gray-500">PNG, JPG (AI will extract glucose)</p>
                    </div>
                  )}
                </div>
              </label>

              {ocrResults.glucose && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">✓ AI Extracted: <span className="font-bold">{ocrResults.glucose} mg/dL</span></p>
                </div>
              )}

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-xs font-medium text-gray-500">OR ENTER MANUALLY</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Fasting Glucose (mg/dL) <span className="text-red-500">*</span></label>
                <input type="number" name="glucose" value={formData.glucose} onChange={handleManualInput} placeholder="100" className="w-full px-4 py-3 border border-gray-300 rounded-xl" required min="0" max="500" step="0.1" />
                {glucoseStatus && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ${glucoseStatus.color}`}>{glucoseStatus.text}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {processing && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-blue-900 font-medium text-sm">AI is processing your report...</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" onClick={onBack} className="px-8 py-3 bg-gray-100 rounded-full">Back</button>
              <button type="submit" disabled={processing || loading} className="px-8 py-3 bg-gray-900 text-white rounded-full">{loading ? "Completing..." : "Complete Assessment"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Screen3;
