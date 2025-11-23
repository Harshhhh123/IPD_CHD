// src/components/Screen1.jsx
import { useState, useEffect } from "react";
import { saveToFirebase, getFromFirebase } from "../utils/firebasestorage";
import { getSessionId } from "../utils/sessionManager";

const Screen1 = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    weight: "",
    height: "",
    is_smoking: "",
    cigs_per_day: "",
    diabetes: ""
  });
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false);
  const sessionId = getSessionId();

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getFromFirebase(sessionId, "basicDetails");
        if (saved) {
          setFormData(saved);
          if (saved.bmi) setBmi(saved.bmi);
        }
      } catch (err) {
        console.error("Screen1 loadData error:", err);
      }
    };
    loadData();
  }, [sessionId]);

  useEffect(() => {
    if (formData.weight && formData.height) {
      const weight = parseFloat(formData.weight);
      const heightCm = parseFloat(formData.height);

      if (weight > 0 && heightCm > 0) {
        const heightM = heightCm / 100;
        const calculatedBmi = weight / (heightM * heightM);
        setBmi(calculatedBmi.toFixed(2));
      } else {
        setBmi(null);
      }
    } else {
      setBmi(null);
    }
  }, [formData.weight, formData.height]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.age || !formData.sex || !formData.weight || !formData.height || !formData.is_smoking || !formData.diabetes) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.is_smoking === "yes" && !formData.cigs_per_day) {
      alert("Please enter cigarettes per day");
      return;
    }

    setLoading(true);

    try {
      const weight = parseFloat(formData.weight);
      const heightCm = parseFloat(formData.height);
      const heightM = heightCm / 100;
      const calculatedBmi = weight / (heightM * heightM);

      const dataToSave = {
        age: formData.age,
        sex: formData.sex,
        bmi: calculatedBmi.toFixed(2),
        is_smoking: formData.is_smoking,
        cigs_per_day: formData.cigs_per_day || "0",
        diabetes: formData.diabetes
      };

      await saveToFirebase(sessionId, "basicDetails", dataToSave);
      setLoading(false);
      onNext();
    } catch (error) {
      setLoading(false);
      console.error("Screen1 save error:", error);
      alert("Error saving data. Please try again.");
    }
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return "";
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { text: "Underweight", color: "text-blue-600" };
    if (bmiValue < 25) return { text: "Normal", color: "text-green-600" };
    if (bmiValue < 30) return { text: "Overweight", color: "text-yellow-600" };
    return { text: "Obese", color: "text-red-600" };
  };

  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* header + form (kept same as your original) */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 text-white font-bold text-lg mb-4">1</div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Basic Information</h1>
          <p className="text-gray-600">Step 1 of 3 • Personal details</p>
          <div className="mt-6 w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
            <div className="bg-gray-900 h-1.5 rounded-full transition-all duration-500" style={{ width: "33%" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* form fields: age, sex, weight, height, smoking, cigs_per_day, diabetes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Age <span className="text-red-500">*</span></label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Enter age" className="w-full px-4 py-3 border border-gray-300 rounded-xl" required min="1" max="120" />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Sex <span className="text-red-500">*</span></label>
                <select name="sex" value={formData.sex} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Weight (kg) <span className="text-red-500">*</span></label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="70" className="w-full px-4 py-3 border border-gray-300 rounded-xl" required min="1" step="0.1" />
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Height (cm) <span className="text-red-500">*</span></label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="170" className="w-full px-4 py-3 border border-gray-300 rounded-xl" required min="1" step="0.1" />
                {bmi && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">BMI:</span>
                      <span className={`font-semibold ${bmiCategory.color}`}>{bmi} • {bmiCategory.text}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Smoking */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Do you smoke? <span className="text-red-500">*</span></label>
                <select name="is_smoking" value={formData.is_smoking} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Cigarettes per day */}
              {formData.is_smoking === "yes" && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Cigarettes per day <span className="text-red-500">*</span></label>
                  <input type="number" name="cigs_per_day" value={formData.cigs_per_day} onChange={handleChange} placeholder="10" className="w-full px-4 py-3 border border-gray-300 rounded-xl" required min="0" />
                </div>
              )}

              {/* Diabetes */}
              <div className={formData.is_smoking === "yes" ? "" : "md:col-span-2"}>
                <label className="block text-sm font-medium text-gray-900 mb-2">Do you have diabetes? <span className="text-red-500">*</span></label>
                <select name="diabetes" value={formData.diabetes} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl" required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
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

export default Screen1;
