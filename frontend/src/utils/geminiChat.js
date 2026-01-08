// // src/utils/geminiChat.js
// // Gemini Chat utility for health recommendations and chatbot

// // Get API key from environment
// const getApiKey = () => {
//   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
//   if (!apiKey) {
//     throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
//   }
//   return apiKey;
// };

// // List available models to find one that works (same as OCR implementation)
// const listAvailableModels = async (apiKey) => {
//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
//     );
//     if (response.ok) {
//       const data = await response.json();
//       return data.models || [];
//     }
//   } catch (error) {
//     console.warn('Could not list models:', error);
//   }
//   return [];
// };

// // Free tier models only - these don't require payment (same as OCR implementation)
// const FREE_TIER_MODELS = [
//   'gemini-1.5-flash'
// ];

// // Check if model is free tier (same as OCR implementation)
// const isFreeTierModel = (modelName) => {
//   if (!modelName) return false;
//   const name = modelName.toLowerCase();
//   // Exclude premium/paid models
//   if (name.includes('2.5') || name.includes('ultra') || name.includes('exp') || 
//       name.includes('preview') || name.includes('experimental') || name.includes('paid')) {
//     return false;
//   }
//   // Include only known free models
//   return FREE_TIER_MODELS.some(freeModel => name.includes(freeModel.toLowerCase()));
// };

// // Get working model (same logic as OCR implementation)
// const getWorkingModel = async (apiKey) => {
//     return 'gemini-1.5-flash';
// };

// // Feature name mapping for better readability
// const featureNameMap = {
//   sysBP: "Systolic Blood Pressure",
//   diaBP: "Diastolic Blood Pressure", 
//   totChol: "Total Cholesterol",
//   BMI: "Body Mass Index",
//   glucose: "Blood Glucose",
//   age: "Age",
//   currentSmoker: "Current Smoker",
//   cigsPerDay: "Cigarettes per Day",
//   pulse_pressure: "Pulse Pressure",
//   bp_ratio: "Blood Pressure Ratio",
//   chol_bmi_ratio: "Cholesterol to BMI Ratio",
//   age_glucose_interaction: "Age-Glucose Interaction",
//   bpmeds_hyp: "BP Medications with Hypertension",
//   smoker_intensity: "Smoking Intensity",
//   male: "Gender (Male)",
//   BPMeds: "Blood Pressure Medication",
//   prevalentStroke: "Previous Stroke",
//   prevalentHyp: "Hypertension",
//   diabetes: "Diabetes",
// };

// // Convert SHAP values to readable format
// const formatShapData = (shapValues, featureValues) => {
//   const topFactors = Object.entries(shapValues)
//     .map(([feature, impact]) => ({
//       feature,
//       name: featureNameMap[feature] || feature,
//       impact: Number(impact),
//       value: featureValues[feature],
//       direction: Number(impact) >= 0 ? 'increases' : 'decreases'
//     }))
//     .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
//     .slice(0, 8); // Top 8 factors

//   return topFactors;
// };

// // Generate initial personalized health recommendations
// export const generateInitialRecommendations = async (userData, shapValues, probability) => {
//   try {
//     const apiKey = getApiKey();
    
//     // Get working model using same logic as OCR implementation
//     const modelName = await getWorkingModel(apiKey);
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
//     console.log(`Using FREE TIER model: ${modelName} (v1beta)...`);
    
//     const topFactors = formatShapData(shapValues, userData);
//     const riskLevel = probability >= 0.5 ? 'HIGH' : probability >= 0.2 ? 'MODERATE' : 'LOW';
//     const riskPercentage = Math.round(probability * 100);
    
//     // Create structured user profile for context
//     const userProfile = {
//       age: userData.age,
//       gender: userData.male ? 'Male' : 'Female',
//       smoking: userData.currentSmoker ? `Yes (${userData.cigsPerDay} per day)` : 'No',
//       diabetes: userData.diabetes ? 'Yes' : 'No',
//       hypertension: userData.prevalentHyp ? 'Yes' : 'No',
//       previousStroke: userData.prevalentStroke ? 'Yes' : 'No',
//       onBPMedication: userData.BPMeds ? 'Yes' : 'No',
//       systolicBP: userData.sysBP,
//       diastolicBP: userData.diaBP,
//       cholesterol: userData.totChol,
//       glucose: userData.glucose,
//       bmi: userData.BMI
//     };

//     const prompt = `You are a cardiovascular health expert. Provide CONCISE, actionable recommendations.

// PATIENT: ${userProfile.age}yr ${userProfile.gender}, BP: ${userProfile.systolicBP}/${userProfile.diastolicBP}
// RISK: ${riskLevel} (${riskPercentage}%)
// TOP FACTORS: ${topFactors.slice(0, 3).map(f => `${f.name}: ${f.value}`).join(', ')}

// Return ONLY this JSON (no extra text):
// {
//   "greeting": "Brief personal greeting (1 sentence)",
//   "keyInsights": [
//     "2-3 short insights about their main risk factors"
//   ],
//   "recommendations": {
//     "diet": {
//       "title": "Diet",
//       "items": ["3 specific food changes"]
//     },
//     "exercise": {
//       "title": "Exercise", 
//       "items": ["2 specific activities"]
//     },
//     "lifestyle": {
//       "title": "Lifestyle",
//       "items": ["2 immediate changes"]
//     },
//     "monitoring": {
//       "title": "Monitoring",
//       "items": ["When to check what"]
//     }
//   },
//   "priorityActions": [
//     "Top 3 immediate actions (1 line each)"
//   ],
//   "encouragement": "Motivational message (1 sentence)"
// }

// Make everything SHORT and ACTION-FOCUSED. Max 15 words per item.`;

//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: prompt
//               }
//             ]
//           }
//         ]
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
//     }

//     const data = await response.json();
//     const textResponse = data.candidates[0].content.parts[0].text;
    
//     // Extract JSON from response
//     let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
//       if (jsonMatch) {
//         jsonMatch = [jsonMatch[1]];
//       }
//     }
    
//     if (!jsonMatch) {
//       throw new Error('Could not extract valid JSON from Gemini response');
//     }
    
//     return JSON.parse(jsonMatch[0]);
//   } catch (error) {
//     console.error('Error generating initial recommendations:', error);
//     throw error;
//   }
// };

// // Chat with Gemini while maintaining health context
// export const chatWithGemini = async (message, conversationHistory, userData, shapValues) => {
//   try {
//     const apiKey = getApiKey();
    
//     // Get working model using same logic as OCR implementation  
//     const modelName = await getWorkingModel(apiKey);
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
//     console.log(`Using FREE TIER model: ${modelName} for chat...`);
    
//     // Build conversation context
//     const conversationContext = conversationHistory.length > 0 
//       ? conversationHistory.slice(-3).map(msg => 
//           `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
//         ).join('\n')
//       : '';

//     const fullPrompt = `You are a concise cardiovascular health expert. Give SHORT, actionable answers.

// PATIENT: ${userData.age}yr ${userData.male ? 'M' : 'F'}, BP: ${userData.sysBP}/${userData.diaBP}, Smoking: ${userData.currentSmoker ? 'Yes' : 'No'}

// RECENT CHAT:
// ${conversationContext}

// USER: ${message}

// RULES:
// - Max 2-3 sentences (under 200 characters)
// - Give specific actions, not explanations  
// - Use bullet points for lists
// - End with "Consult your doctor for personalized advice"
// - Be direct and helpful

// RESPONSE:`;

//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: fullPrompt
//               }
//             ]
//           }
//         ]
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
//     }

//     const data = await response.json();
//     const aiResponse = data.candidates[0].content.parts[0].text;
    
//     return aiResponse.trim();
//   } catch (error) {
//     console.error('Error in chat with Gemini:', error);
//     throw error;
//   }
// };

// // Utility to check if Gemini API is available
// export const checkGeminiAvailability = async () => {
//   try {
//     const apiKey = getApiKey();
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
//     );
//     return response.ok;
//   } catch (error) {
//     return false;
//   }
// };

// src/utils/geminiChat.js
// Gemini Chat utility for health recommendations and chatbot

// Get API key from environment
// const getApiKey = () => {
//   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
//   if (!apiKey) {
//     throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
//   }
//   return apiKey;
// };

// // Feature name mapping for better readability
// const featureNameMap = {
//   sysBP: "Systolic Blood Pressure",
//   diaBP: "Diastolic Blood Pressure", 
//   totChol: "Total Cholesterol",
//   BMI: "Body Mass Index",
//   glucose: "Blood Glucose",
//   age: "Age",
//   currentSmoker: "Current Smoker",
//   cigsPerDay: "Cigarettes per Day",
//   pulse_pressure: "Pulse Pressure",
//   bp_ratio: "Blood Pressure Ratio",
//   chol_bmi_ratio: "Cholesterol to BMI Ratio",
//   age_glucose_interaction: "Age-Glucose Interaction",
//   bpmeds_hyp: "BP Medications with Hypertension",
//   smoker_intensity: "Smoking Intensity",
//   male: "Gender (Male)",
//   BPMeds: "Blood Pressure Medication",
//   prevalentStroke: "Previous Stroke",
//   prevalentHyp: "Hypertension",
//   diabetes: "Diabetes",
// };

// // Convert SHAP values to readable format
// const formatShapData = (shapValues, featureValues) => {
//   const topFactors = Object.entries(shapValues)
//     .map(([feature, impact]) => ({
//       feature,
//       name: featureNameMap[feature] || feature,
//       impact: Number(impact),
//       value: featureValues[feature],
//       direction: Number(impact) >= 0 ? 'increases' : 'decreases'
//     }))
//     .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
//     .slice(0, 8); // Top 8 factors

//   return topFactors;
// };

// // Generate initial personalized health recommendations
// export const generateInitialRecommendations = async (userData, shapValues, probability) => {
//   try {
//     const apiKey = getApiKey();
    
//     // Use Google's official working model from their documentation
//     const modelName = 'gemini-2.5-flash';
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
//     console.log(`Using official Google model: ${modelName} with v1beta API...`);
    
//     const topFactors = formatShapData(shapValues, userData);
//     const riskLevel = probability >= 0.5 ? 'HIGH' : probability >= 0.2 ? 'MODERATE' : 'LOW';
//     const riskPercentage = Math.round(probability * 100);
    
//     // Create structured user profile for context
//     const userProfile = {
//       age: userData.age,
//       gender: userData.male ? 'Male' : 'Female',
//       smoking: userData.currentSmoker ? `Yes (${userData.cigsPerDay} per day)` : 'No',
//       diabetes: userData.diabetes ? 'Yes' : 'No',
//       hypertension: userData.prevalentHyp ? 'Yes' : 'No',
//       previousStroke: userData.prevalentStroke ? 'Yes' : 'No',
//       onBPMedication: userData.BPMeds ? 'Yes' : 'No',
//       systolicBP: userData.sysBP,
//       diastolicBP: userData.diaBP,
//       cholesterol: userData.totChol,
//       glucose: userData.glucose,
//       bmi: userData.BMI
//     };

//     const prompt = `You are a cardiovascular health expert. Provide CONCISE, actionable recommendations.

// PATIENT: ${userProfile.age}yr ${userProfile.gender}, BP: ${userProfile.systolicBP}/${userProfile.diastolicBP}
// RISK: ${riskLevel} (${riskPercentage}%)
// TOP FACTORS: ${topFactors.slice(0, 3).map(f => `${f.name}: ${f.value}`).join(', ')}

// Return ONLY this JSON (no extra text):
// {
//   "greeting": "Brief personal greeting (1 sentence)",
//   "keyInsights": [
//     "2-3 short insights about their main risk factors"
//   ],
//   "recommendations": {
//     "diet": {
//       "title": "Diet",
//       "items": ["3 specific food changes"]
//     },
//     "exercise": {
//       "title": "Exercise", 
//       "items": ["2 specific activities"]
//     },
//     "lifestyle": {
//       "title": "Lifestyle",
//       "items": ["2 immediate changes"]
//     },
//     "monitoring": {
//       "title": "Monitoring",
//       "items": ["When to check what"]
//     }
//   },
//   "priorityActions": [
//     "Top 3 immediate actions (1 line each)"
//   ],
//   "encouragement": "Motivational message (1 sentence)"
// }

// Make everything SHORT and ACTION-FOCUSED. Max 15 words per item.`;

//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-goog-api-key': apiKey
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: prompt
//               }
//             ]
//           }
//         ]
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
//     }

//     const data = await response.json();
//     const textResponse = data.candidates[0].content.parts[0].text;
    
//     // Extract JSON from response
//     let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
//       if (jsonMatch) {
//         jsonMatch = [jsonMatch[1]];
//       }
//     }
    
//     if (!jsonMatch) {
//       throw new Error('Could not extract valid JSON from Gemini response');
//     }
    
//     return JSON.parse(jsonMatch[0]);
//   } catch (error) {
//     console.error('Error generating initial recommendations:', error);
//     throw error;
//   }
// };

// // Chat with Gemini while maintaining health context
// export const chatWithGemini = async (message, conversationHistory, userData, shapValues) => {
//   try {
//     const apiKey = getApiKey();
    
//     // Use Google's official working model from their documentation
//     const modelName = 'gemini-2.5-flash';
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
//     console.log(`Using official Google model: ${modelName} for chat...`);
    
//     // Build conversation context
//     const conversationContext = conversationHistory.length > 0 
//       ? conversationHistory.slice(-3).map(msg => 
//           `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
//         ).join('\n')
//       : '';

//     const fullPrompt = `You are a concise cardiovascular health expert. Give SHORT, actionable answers.

// PATIENT: ${userData.age}yr ${userData.male ? 'M' : 'F'}, BP: ${userData.sysBP}/${userData.diaBP}, Smoking: ${userData.currentSmoker ? 'Yes' : 'No'}

// RECENT CHAT:
// ${conversationContext}

// USER: ${message}

// RULES:
// - Max 2-3 sentences (under 200 characters)
// - Give specific actions, not explanations  
// - Use bullet points for lists
// - End with "Consult your doctor for personalized advice"
// - Be direct and helpful

// RESPONSE:`;

//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-goog-api-key': apiKey
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: fullPrompt
//               }
//             ]
//           }
//         ]
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
//     }

//     const data = await response.json();
//     const aiResponse = data.candidates[0].content.parts[0].text;
    
//     return aiResponse.trim();
//   } catch (error) {
//     console.error('Error in chat with Gemini:', error);
//     throw error;
//   }
// };

// // Utility to check if Gemini API is available
// export const checkGeminiAvailability = async () => {
//   try {
//     const apiKey = getApiKey();
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
//     );
//     return response.ok;
//   } catch (error) {
//     return false;
//   }
// };

// src/utils/geminiChat.js - PROFESSIONAL VERSION WITH COMPATIBILITY LAYER
// Gemini Chat utility for health recommendations and chatbot

// Get API key from environment
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
  }
  return apiKey;
};

// Professional medical feature name mapping
const featureNameMap = {
  sysBP: "Systolic Blood Pressure",
  diaBP: "Diastolic Blood Pressure", 
  totChol: "Total Cholesterol",
  BMI: "Body Mass Index",
  glucose: "Fasting Blood Glucose",
  age: "Age",
  currentSmoker: "Current Smoking Status",
  cigsPerDay: "Cigarettes per Day",
  pulse_pressure: "Pulse Pressure",
  bp_ratio: "Blood Pressure Ratio",
  chol_bmi_ratio: "Cholesterol-to-BMI Ratio",
  age_glucose_interaction: "Age-Glucose Interaction",
  bpmeds_hyp: "BP Medications with Hypertension",
  smoker_intensity: "Smoking Intensity Index",
  male: "Gender (Male)",
  BPMeds: "Antihypertensive Medications",
  prevalentStroke: "Previous Cerebrovascular Accident",
  prevalentHyp: "Hypertension History",
  diabetes: "Diabetes Mellitus",
};

// Enhanced risk assessment function
const assessRiskLevel = (probability) => {
  if (probability >= 0.7) return { level: 'VERY HIGH', urgency: 'IMMEDIATE', color: 'red' };
  if (probability >= 0.5) return { level: 'HIGH', urgency: 'URGENT', color: 'orange' };
  if (probability >= 0.3) return { level: 'MODERATE', urgency: 'MONITOR CLOSELY', color: 'yellow' };
  if (probability >= 0.15) return { level: 'MILD', urgency: 'LIFESTYLE FOCUS', color: 'lightgreen' };
  return { level: 'LOW', urgency: 'PREVENTIVE', color: 'green' };
};

// Convert SHAP values to readable format with clinical significance
const formatShapData = (shapValues, featureValues) => {
  const topFactors = Object.entries(shapValues)
    .map(([feature, impact]) => {
      const clinicalSignificance = getClinicalSignificance(feature, featureValues[feature], impact);
      return {
        feature,
        name: featureNameMap[feature] || feature,
        impact: Number(impact),
        value: featureValues[feature],
        direction: Number(impact) >= 0 ? 'increases' : 'decreases',
        clinicalNote: clinicalSignificance
      };
    })
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 8);

  return topFactors;
};

// Clinical significance interpreter
const getClinicalSignificance = (feature, value, impact) => {
  const significance = {
    sysBP: value > 140 ? "Hypertensive range - major CVD risk factor" : 
           value > 130 ? "Stage 1 hypertension - intervention needed" : "Optimal range",
    totChol: value > 240 ? "High cholesterol - statin therapy consideration" :
             value > 200 ? "Borderline high - dietary intervention" : "Desirable level",
    BMI: value > 30 ? "Obese - significant metabolic risk" :
         value > 25 ? "Overweight - lifestyle modification needed" : "Normal weight",
    glucose: value > 126 ? "Diabetic range - requires management" :
             value > 100 ? "Prediabetic - intervention critical" : "Normal glucose",
    currentSmoker: value === 1 ? "Active smoking - highest modifiable risk factor" : "Non-smoker advantage",
    age: value > 65 ? "Advanced age - increased baseline risk" : "Younger age protective"
  };
  return significance[feature] || "Within normal parameters";
};

// Generate comprehensive personalized health recommendations
export const generateInitialRecommendations = async (userData, shapValues, probability) => {
  try {
    const apiKey = getApiKey();
    
    const modelName = 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Generating professional medical recommendations...`);
    
    const topFactors = formatShapData(shapValues, userData);
    const riskAssessment = assessRiskLevel(probability);
    const riskPercentage = Math.round(probability * 100);
    
    // Comprehensive user clinical profile
    const clinicalProfile = {
      demographics: {
        age: userData.age,
        gender: userData.male ? 'Male' : 'Female'
      },
      vitals: {
        systolic: userData.sysBP,
        diastolic: userData.diaBP,
        bmi: userData.BMI
      },
      laboratory: {
        totalCholesterol: userData.totChol,
        fastingGlucose: userData.glucose
      },
      lifestyle: {
        smokingStatus: userData.currentSmoker ? 'Active smoker' : 'Non-smoker',
        cigarettesPerDay: userData.currentSmoker ? userData.cigsPerDay : 0
      },
      medicalHistory: {
        hypertension: userData.prevalentHyp ? 'Present' : 'Absent',
        diabetes: userData.diabetes ? 'Present' : 'Absent',
        stroke: userData.prevalentStroke ? 'Previous CVA' : 'No history',
        antihypertensives: userData.BPMeds ? 'Currently prescribed' : 'Not on therapy'
      }
    };

    const professionalPrompt = `You are a board-certified cardiologist providing comprehensive cardiovascular recommendations. Create a detailed yet accessible assessment that demonstrates medical expertise while being practical for the patient.

PATIENT CLINICAL PROFILE:
• Demographics: ${clinicalProfile.demographics.age}-year-old ${clinicalProfile.demographics.gender}
• Vital Signs: BP ${clinicalProfile.vitals.systolic}/${clinicalProfile.vitals.diastolic} mmHg, BMI ${clinicalProfile.vitals.bmi}
• Laboratory: Total Cholesterol ${clinicalProfile.laboratory.totalCholesterol} mg/dL, Fasting Glucose ${clinicalProfile.laboratory.fastingGlucose} mg/dL
• Lifestyle: ${clinicalProfile.lifestyle.smokingStatus}${clinicalProfile.lifestyle.cigarettesPerDay > 0 ? ` (${clinicalProfile.lifestyle.cigarettesPerDay} cigarettes/day)` : ''}
• Medical History: HTN ${clinicalProfile.medicalHistory.hypertension}, DM ${clinicalProfile.medicalHistory.diabetes}, CVA ${clinicalProfile.medicalHistory.stroke}
• Current Medications: Antihypertensives ${clinicalProfile.medicalHistory.antihypertensives}

CARDIOVASCULAR RISK ANALYSIS:
• 10-Year CVD Risk: ${riskAssessment.level} (${riskPercentage}%) - ${riskAssessment.urgency} attention required
• Primary Risk Factors Contributing to Assessment:
${topFactors.slice(0, 4).map((f, i) => `  ${i + 1}. ${f.name}: ${f.value} - ${f.clinicalNote}`).join('\n')}

Provide your assessment in the following JSON format with professional medical language:

{
  "greeting": "Brief, professional greeting acknowledging their risk level and main concerns (1-2 sentences)",
  "keyInsights": [
    "Clinical insight about their primary risk factor with specific values",
    "Medical significance of their current risk profile", 
    "Key opportunity for cardiovascular protection"
  ],
  "recommendations": {
    "diet": {
      "title": "Cardiovascular Nutrition",
      "items": [
        "Specific dietary pattern recommendation (e.g., Mediterranean, DASH) with target goals",
        "Sodium restriction target (<2300mg daily) with practical implementation",
        "Heart-protective nutrients to emphasize (omega-3, fiber, antioxidants)"
      ]
    },
    "exercise": {
      "title": "Exercise Prescription", 
      "items": [
        "Specific aerobic exercise prescription with intensity and duration (e.g., 150 min moderate)",
        "Resistance training recommendation with frequency and safety considerations"
      ]
    },
    "lifestyle": {
      "title": "Risk Factor Management",
      "items": [
        "Most critical lifestyle modification based on their profile",
        "Sleep, stress management, or smoking cessation if applicable"
      ]
    },
    "monitoring": {
      "title": "Clinical Surveillance",
      "items": [
        "Home monitoring recommendations with target values",
        "Professional follow-up schedule and key parameters to track"
      ]
    }
  },
  "priorityActions": [
    "Highest impact intervention to implement within 1-2 weeks",
    "Second priority action for 2-4 week timeframe",
    "Third priority for 1-2 month implementation"
  ],
  "encouragement": "Evidence-based, realistic encouragement specific to their risk level and prognosis"
}

Use evidence-based medical language while keeping recommendations practical and specific. Reference clinical targets where appropriate (BP <130/80, LDL <100, etc.). This should demonstrate cardiovascular expertise while being genuinely helpful.`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: professionalPrompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]];
      }
    }
    
    if (!jsonMatch) {
      throw new Error('Could not extract valid JSON from Gemini response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating professional recommendations:', error);
    throw error;
  }
};

// Professional medical chat with clinical expertise
export const chatWithGemini = async (message, conversationHistory, userData, shapValues, probability = 0.3) => {
  try {
    const apiKey = getApiKey();
    
    const modelName = 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Providing clinical consultation response...`);
    
    const riskAssessment = assessRiskLevel(probability);
    const topFactors = formatShapData(shapValues, userData);
    
    // Build conversation context with clinical relevance
    const conversationContext = conversationHistory.length > 0 
      ? conversationHistory.slice(-3).map(msg => 
          `${msg.role === 'user' ? 'Patient' : 'Dr. Assistant'}: ${msg.content}`
        ).join('\n')
      : '';

    const professionalChatPrompt = `You are a friendly cardiovascular health assistant speaking to a non-medical patient.
Use clear spacing, emojis, and short lines.
Do NOT use HTML tags (<u>, <b>, etc.) or markdown symbols.
Keep responses under 150 words.

PATIENT:
Age: ${userData.age} years
Sex: ${userData.male ? 'Male' : 'Female'}
BP: ${userData.sysBP}/${userData.diaBP} mmHg
Risk Level: ${riskAssessment.level}

QUESTION:
"${message}"

RESPONSE FORMAT (EXACT):

💡 Key Point
One clear sentence answering the question.

✅ What You Can Do
• Action step with numbers if possible
• Second practical step
• Optional third step

❤️ Why This Matters
One short, simple explanation.

👉 Next Step
One clear action to take next.

End with:
Talk to your doctor before making major changes.

🧪 Example Output (What It Will Look Like)

💡 Key Point
Healthy eating and regular activity can help lower your cholesterol.

✅ What You Can Do
• Eat oats, beans, fruits, and veggies daily
• Walk at least 30 minutes, 5 days/week
• Choose nuts, olive oil, and fish over fried foods

❤️ Why This Matters
Lower cholesterol reduces your risk of heart attack and stroke.

👉 Next Step
Review your cholesterol numbers with your doctor.

Talk to your doctor before making major changes.`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: professionalChatPrompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    return aiResponse.trim();
  } catch (error) {
    console.error('Error in professional medical consultation:', error);
    throw error;
  }
};

// Utility to check if Gemini API is available
export const checkGeminiAvailability = async () => {
  try {
    const apiKey = getApiKey();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    return response.ok;
  } catch (error) {
    return false;
  }
};