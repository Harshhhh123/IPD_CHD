// src/utils/geminiExtraction.js

// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// List available models to find one that works
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

// Free tier models only - these don't require payment
const FREE_TIER_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-pro'
];

// Check if model is free tier
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

// Extract cholesterol using Gemini - searches for TOTAL CHOLESTEROL
export const extractCholesterolWithGemini = async (file) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    const base64 = await fileToBase64(file);
    
    // Determine MIME type
    const mimeType = file.type || 'image/jpeg';
    
    // First, try to get available models to find a FREE TIER one that works
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
    const modelName = workingModel || 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Using FREE TIER model: ${modelName} (v1beta)...`);
    
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
                text: `You are analyzing a medical lipid profile test report. 

Your task:
1. Look for "TOTAL CHOLESTEROL" in the test results table
2. Extract the numeric value (in mg/dL) associated with TOTAL CHOLESTEROL
3. Return ONLY a valid JSON object in this exact format:
{
  "cholesterol": <numeric_value>
}

Important:
- The value should be a number (e.g., 180, 200.5)
- If you cannot find "TOTAL CHOLESTEROL" or its value, return: {"cholesterol": null}
- Do NOT include any other text, explanations, markdown formatting, or code blocks
- Return ONLY the JSON object`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64
                }
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('Gemini API Error Details:', errorData);
      throw new Error(`Failed to extract cholesterol: ${errorMessage}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    console.log('Gemini Response for Cholesterol:', textResponse);
    
    // Extract JSON from response (handle markdown code blocks if present)
    let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON in code blocks
      jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]];
      }
    }
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    const cholesterol = result.cholesterol;
    
    if (cholesterol !== null && cholesterol !== undefined && !isNaN(cholesterol) && cholesterol > 0) {
      return { cholesterol: parseFloat(cholesterol), rawResponse: textResponse };
    }
    
    return { cholesterol: null, rawResponse: textResponse };
  } catch (error) {
    console.error('Gemini Extraction Error:', error);
    throw error;
  }
};

// Extract glucose using Gemini - searches for FASTING GLUCOSE or FASTING BLOOD SUGAR
export const extractGlucoseWithGemini = async (file) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    const base64 = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';
    
    // First, try to get available models to find a FREE TIER one that works
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
    const modelName = workingModel || 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Using FREE TIER model: ${modelName} (v1beta)...`);
    
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
                text: `You are analyzing a medical blood sugar test report.

Your task:
1. Look for "FASTING GLUCOSE" OR "FASTING BLOOD SUGAR" in the test results table
2. Extract the numeric value (in mg/dL) associated with the fasting glucose/blood sugar test
3. Return ONLY a valid JSON object in this exact format:
{
  "glucose": <numeric_value>
}

Important:
- Search for these exact terms: "FASTING GLUCOSE", "FASTING BLOOD SUGAR", "FBS", or "FASTING"
- The value should be a number (e.g., 82, 100.5)
- If you cannot find fasting glucose/blood sugar value, return: {"glucose": null}
- Do NOT include any other text, explanations, markdown formatting, or code blocks
- Return ONLY the JSON object`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64
                }
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('Gemini API Error Details:', errorData);
      throw new Error(`Failed to extract glucose: ${errorMessage}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    console.log('Gemini Response for Glucose:', textResponse);
    
    // Extract JSON from response
    let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON in code blocks
      jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]];
      }
    }
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    const glucose = result.glucose;
    
    if (glucose !== null && glucose !== undefined && !isNaN(glucose) && glucose > 0) {
      return { glucose: parseFloat(glucose), rawResponse: textResponse };
    }
    
    return { glucose: null, rawResponse: textResponse };
  } catch (error) {
    console.error('Gemini Extraction Error:', error);
    throw error;
  }
};

