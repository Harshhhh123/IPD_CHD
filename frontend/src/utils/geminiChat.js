// src/utils/geminiChat.js
// Gemini Chat utility for health recommendations and chatbot

// Get API key from environment
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
  }
  return apiKey;
};

// List available models to find one that works (same as OCR implementation)
const listAvailableModels = async (apiKey) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.models || [];
    }
  } catch (error) {
    console.warn('Could not list models:', error);
  }
  return [];
};

// Free tier models only - these don't require payment (same as OCR implementation)
const FREE_TIER_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-pro'
];

// Check if model is free tier (same as OCR implementation)
const isFreeTierModel = (modelName) => {
  if (!modelName) return false;
  const name = modelName.toLowerCase();
  // Exclude premium/paid models
  if (name.includes('2.5') || name.includes('ultra') || name.includes('exp') || 
      name.includes('preview') || name.includes('experimental') || name.includes('paid')) {
    return false;
  }
  // Include only known free models
  return FREE_TIER_MODELS.some(freeModel => name.includes(freeModel.toLowerCase()));
};

// Get working model (same logic as OCR implementation)
const getWorkingModel = async (apiKey) => {
  console.log('Checking available FREE TIER models...');
  let workingModel = null;
  const availableModels = await listAvailableModels(apiKey);
  
  if (availableModels.length > 0) {
    // Find first FREE TIER model that supports generateContent
    const working = availableModels.find(m => {
      const parts = m.name.split('/');
      const modelName = parts[parts.length - 1];
      return m.supportedGenerationMethods?.includes('generateContent') && 
             isFreeTierModel(modelName);
    });
    if (working) {
      const parts = working.name.split('/');
      workingModel = parts[parts.length - 1];
      console.log(`Found FREE TIER model: ${workingModel}`);
    } else {
      console.log('No free tier models found in available list, using default...');
    }
  }
  
  // Use found free model or fallback to gemini-1.5-flash (guaranteed free tier)
  return workingModel || 'gemini-1.5-flash';
};

// Feature name mapping for better readability
const featureNameMap = {
  sysBP: "Systolic Blood Pressure",
  diaBP: "Diastolic Blood Pressure", 
  totChol: "Total Cholesterol",
  BMI: "Body Mass Index",
  glucose: "Blood Glucose",
  age: "Age",
  currentSmoker: "Current Smoker",
  cigsPerDay: "Cigarettes per Day",
  pulse_pressure: "Pulse Pressure",
  bp_ratio: "Blood Pressure Ratio",
  chol_bmi_ratio: "Cholesterol to BMI Ratio",
  age_glucose_interaction: "Age-Glucose Interaction",
  bpmeds_hyp: "BP Medications with Hypertension",
  smoker_intensity: "Smoking Intensity",
  male: "Gender (Male)",
  BPMeds: "Blood Pressure Medication",
  prevalentStroke: "Previous Stroke",
  prevalentHyp: "Hypertension",
  diabetes: "Diabetes",
};

// Convert SHAP values to readable format
const formatShapData = (shapValues, featureValues) => {
  const topFactors = Object.entries(shapValues)
    .map(([feature, impact]) => ({
      feature,
      name: featureNameMap[feature] || feature,
      impact: Number(impact),
      value: featureValues[feature],
      direction: Number(impact) >= 0 ? 'increases' : 'decreases'
    }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 8); // Top 8 factors

  return topFactors;
};

// Generate initial personalized health recommendations
export const generateInitialRecommendations = async (userData, shapValues, probability) => {
  try {
    const apiKey = getApiKey();
    
    // Get working model using same logic as OCR implementation
    const modelName = await getWorkingModel(apiKey);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Using FREE TIER model: ${modelName} (v1beta)...`);
    
    const topFactors = formatShapData(shapValues, userData);
    const riskLevel = probability >= 0.5 ? 'HIGH' : probability >= 0.2 ? 'MODERATE' : 'LOW';
    const riskPercentage = Math.round(probability * 100);
    
    // Create structured user profile for context
    const userProfile = {
      age: userData.age,
      gender: userData.male ? 'Male' : 'Female',
      smoking: userData.currentSmoker ? `Yes (${userData.cigsPerDay} per day)` : 'No',
      diabetes: userData.diabetes ? 'Yes' : 'No',
      hypertension: userData.prevalentHyp ? 'Yes' : 'No',
      previousStroke: userData.prevalentStroke ? 'Yes' : 'No',
      onBPMedication: userData.BPMeds ? 'Yes' : 'No',
      systolicBP: userData.sysBP,
      diastolicBP: userData.diaBP,
      cholesterol: userData.totChol,
      glucose: userData.glucose,
      bmi: userData.BMI
    };

    const prompt = `You are a cardiovascular health expert. Provide CONCISE, actionable recommendations.

PATIENT: ${userProfile.age}yr ${userProfile.gender}, BP: ${userProfile.systolicBP}/${userProfile.diastolicBP}
RISK: ${riskLevel} (${riskPercentage}%)
TOP FACTORS: ${topFactors.slice(0, 3).map(f => `${f.name}: ${f.value}`).join(', ')}

Return ONLY this JSON (no extra text):
{
  "greeting": "Brief personal greeting (1 sentence)",
  "keyInsights": [
    "2-3 short insights about their main risk factors"
  ],
  "recommendations": {
    "diet": {
      "title": "Diet",
      "items": ["3 specific food changes"]
    },
    "exercise": {
      "title": "Exercise", 
      "items": ["2 specific activities"]
    },
    "lifestyle": {
      "title": "Lifestyle",
      "items": ["2 immediate changes"]
    },
    "monitoring": {
      "title": "Monitoring",
      "items": ["When to check what"]
    }
  },
  "priorityActions": [
    "Top 3 immediate actions (1 line each)"
  ],
  "encouragement": "Motivational message (1 sentence)"
}

Make everything SHORT and ACTION-FOCUSED. Max 15 words per item.`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
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
    console.error('Error generating initial recommendations:', error);
    throw error;
  }
};

// Chat with Gemini while maintaining health context
export const chatWithGemini = async (message, conversationHistory, userData, shapValues) => {
  try {
    const apiKey = getApiKey();
    
    // Get working model using same logic as OCR implementation  
    const modelName = await getWorkingModel(apiKey);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Using FREE TIER model: ${modelName} for chat...`);
    
    // Build conversation context
    const conversationContext = conversationHistory.length > 0 
      ? conversationHistory.slice(-3).map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n')
      : '';

    const fullPrompt = `You are a concise cardiovascular health expert. Give SHORT, actionable answers.

PATIENT: ${userData.age}yr ${userData.male ? 'M' : 'F'}, BP: ${userData.sysBP}/${userData.diaBP}, Smoking: ${userData.currentSmoker ? 'Yes' : 'No'}

RECENT CHAT:
${conversationContext}

USER: ${message}

RULES:
- Max 2-3 sentences (under 200 characters)
- Give specific actions, not explanations  
- Use bullet points for lists
- End with "Consult your doctor for personalized advice"
- Be direct and helpful

RESPONSE:`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
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
    console.error('Error in chat with Gemini:', error);
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