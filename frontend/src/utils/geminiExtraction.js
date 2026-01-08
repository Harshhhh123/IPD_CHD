// // src/utils/geminiExtraction.js

// // Convert file to base64
// const fileToBase64 = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => {
//       const base64 = reader.result.split(',')[1];
//       resolve(base64);
//     };
//     reader.onerror = error => reject(error);
//   });
// };

// // Extract cholesterol using Gemini - searches for TOTAL CHOLESTEROL
// export const extractCholesterolWithGemini = async (file) => {
//   try {
//     const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
//     if (!apiKey) {
//       throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
//     }

//     const base64 = await fileToBase64(file);
//     const mimeType = file.type || 'image/jpeg';
    
//     // Use Google's official working model from their docs
//     const modelName = 'gemini-2.5-flash';
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
//     console.log(`Using official Google model: ${modelName} with v1beta API...`);
    
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
//                 text: `You are analyzing a medical lipid profile test report. 

// Your task:
// 1. Look for "TOTAL CHOLESTEROL" in the test results table
// 2. Extract the numeric value (in mg/dL) associated with TOTAL CHOLESTEROL
// 3. Return ONLY a valid JSON object in this exact format:
// {
//   "cholesterol": <numeric_value>
// }

// Important:
// - The value should be a number (e.g., 180, 200.5)
// - If you cannot find "TOTAL CHOLESTEROL" or its value, return: {"cholesterol": null}
// - Do NOT include any other text, explanations, markdown formatting, or code blocks
// - Return ONLY the JSON object`
//               },
//               {
//                 inlineData: {
//                   mimeType: mimeType,
//                   data: base64
//                 }
//               }
//             ]
//           }
//         ]
//       })
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
//       console.error('Gemini API Error Details:', errorData);
//       throw new Error(`Failed to extract cholesterol: ${errorMessage}`);
//     }

//     const data = await response.json();
//     const textResponse = data.candidates[0].content.parts[0].text;
    
//     console.log('Gemini Response for Cholesterol:', textResponse);
    
//     // Extract JSON from response
//     let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
//       if (jsonMatch) {
//         jsonMatch = [jsonMatch[1]];
//       }
//     }
    
//     if (!jsonMatch) {
//       throw new Error('No valid JSON found in Gemini response');
//     }
    
//     const result = JSON.parse(jsonMatch[0]);
//     const cholesterol = result.cholesterol;
    
//     if (cholesterol !== null && cholesterol !== undefined && !isNaN(cholesterol) && cholesterol > 0) {
//       return { cholesterol: parseFloat(cholesterol), rawResponse: textResponse };
//     }
    
//     return { cholesterol: null, rawResponse: textResponse };
//   } catch (error) {
//     console.error('Gemini Extraction Error:', error);
//     throw error;
//   }
// };

// // Extract glucose using Gemini - searches for FASTING GLUCOSE or FASTING BLOOD SUGAR
// export const extractGlucoseWithGemini = async (file) => {
//   try {
//     const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
//     if (!apiKey) {
//       throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
//     }

//     const base64 = await fileToBase64(file);
//     const mimeType = file.type || 'image/jpeg';
    
//     // Use Google's official working model from their docs
//     const modelName = 'gemini-2.5-flash';
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
//     console.log(`Using official Google model: ${modelName} with v1beta API...`);
    
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
//                 text: `You are analyzing a medical blood sugar test report.

// Your task:
// 1. Look for "FASTING GLUCOSE" OR "FASTING BLOOD SUGAR" in the test results table
// 2. Extract the numeric value (in mg/dL) associated with the fasting glucose/blood sugar test
// 3. Return ONLY a valid JSON object in this exact format:
// {
//   "glucose": <numeric_value>
// }

// Important:
// - Search for these exact terms: "FASTING GLUCOSE", "FASTING BLOOD SUGAR", "FBS", or "FASTING"
// - The value should be a number (e.g., 82, 100.5)
// - If you cannot find fasting glucose/blood sugar value, return: {"glucose": null}
// - Do NOT include any other text, explanations, markdown formatting, or code blocks
// - Return ONLY the JSON object`
//               },
//               {
//                 inlineData: {
//                   mimeType: mimeType,
//                   data: base64
//                 }
//               }
//             ]
//           }
//         ]
//       })
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
//       console.error('Gemini API Error Details:', errorData);
//       throw new Error(`Failed to extract glucose: ${errorMessage}`);
//     }

//     const data = await response.json();
//     const textResponse = data.candidates[0].content.parts[0].text;
    
//     console.log('Gemini Response for Glucose:', textResponse);
    
//     // Extract JSON from response
//     let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
//       if (jsonMatch) {
//         jsonMatch = [jsonMatch[1]];
//       }
//     }
    
//     if (!jsonMatch) {
//       throw new Error('No valid JSON found in Gemini response');
//     }
    
//     const result = JSON.parse(jsonMatch[0]);
//     const glucose = result.glucose;
    
//     if (glucose !== null && glucose !== undefined && !isNaN(glucose) && glucose > 0) {
//       return { glucose: parseFloat(glucose), rawResponse: textResponse };
//     }
    
//     return { glucose: null, rawResponse: textResponse };
//   } catch (error) {
//     console.error('Gemini Extraction Error:', error);
//     throw error;
//   }
// };

// src/utils/geminiExtraction.js - PROFESSIONAL MEDICAL GRADE VERSION

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

// Professional medical cholesterol extraction with clinical validation
export const extractCholesterolWithGemini = async (file) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    const base64 = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';
    
    const modelName = 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Performing clinical-grade cholesterol extraction...`);
    
    const professionalExtractionPrompt = `You are a clinical laboratory specialist with expertise in interpreting lipid panel reports. Your task is to perform precise extraction of cholesterol values from medical laboratory documents.

CLINICAL CONTEXT:
You are analyzing a lipid profile/cholesterol panel report. This is a critical cardiovascular risk assessment parameter that requires accurate extraction for patient safety and clinical decision-making.

EXTRACTION PROTOCOL:
1. SYSTEMATIC SCAN: Examine the entire document methodically, looking for lipid panel sections
2. TARGET IDENTIFICATION: Locate "TOTAL CHOLESTEROL" measurements specifically
3. VALUE VALIDATION: Ensure the extracted value represents the primary total cholesterol reading
4. CLINICAL VERIFICATION: Confirm the value is in standard mg/dL units (typical range 150-300 mg/dL)

SEARCH TERMINOLOGY (in order of priority):
• "TOTAL CHOLESTEROL" (primary target)
• "CHOLESTEROL, TOTAL" 
• "TOTAL CHOL"
• "CHOL TOTAL"
• "T-CHOLESTEROL"
• "CHOLESTEROL (TOTAL)"

EXTRACTION REQUIREMENTS:
• Extract ONLY the numerical value (e.g., 185, 220.5, 240)
• Ignore reference ranges, units, or flags
• If multiple cholesterol values present, select the TOTAL cholesterol specifically
• Verify the value is clinically reasonable (typically 100-400 mg/dL range)

QUALITY ASSURANCE:
• Double-check the extracted value against the document
• Ensure you haven't extracted LDL, HDL, or other cholesterol fractions
• Confirm the value corresponds to the "TOTAL" cholesterol measurement

Return your findings in this exact JSON format:
{
  "cholesterol": <numeric_value_only>
}

CRITICAL INSTRUCTIONS:
• If TOTAL CHOLESTEROL is clearly present: return the numeric value
• If TOTAL CHOLESTEROL cannot be located: return {"cholesterol": null}
• Do NOT include explanatory text, units, ranges, or markdown formatting
• Return ONLY the JSON object
• Ensure clinical accuracy - this data impacts patient care decisions

Professional medical document analysis initiated...`;

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
                text: professionalExtractionPrompt
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
      console.error('Clinical extraction API error:', errorData);
      throw new Error(`Failed to extract cholesterol: ${errorMessage}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    console.log('Clinical cholesterol extraction result:', textResponse);
    
    // Extract JSON from response
    let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]];
      }
    }
    
    if (!jsonMatch) {
      throw new Error('Clinical extraction failed - no valid JSON response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    const cholesterol = result.cholesterol;
    
    // Clinical validation
    if (cholesterol !== null && cholesterol !== undefined && !isNaN(cholesterol) && cholesterol > 0) {
      // Additional clinical range validation
      if (cholesterol < 50 || cholesterol > 500) {
        console.warn(`Cholesterol value ${cholesterol} mg/dL outside typical clinical range - please verify`);
      }
      return { 
        cholesterol: parseFloat(cholesterol), 
        rawResponse: textResponse,
        clinicalNote: getCholesterolAssessment(cholesterol)
      };
    }
    
    return { cholesterol: null, rawResponse: textResponse };
  } catch (error) {
    console.error('Clinical cholesterol extraction error:', error);
    throw error;
  }
};

// Professional medical glucose extraction with clinical validation
export const extractGlucoseWithGemini = async (file) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    const base64 = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';
    
    const modelName = 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`Performing clinical-grade glucose extraction...`);
    
    const professionalGlucosePrompt = `You are a clinical laboratory specialist with expertise in analyzing blood glucose reports. Your task is to perform precise extraction of fasting glucose values from medical laboratory documents.

CLINICAL CONTEXT:
You are analyzing a comprehensive metabolic panel, basic metabolic panel, or dedicated glucose test report. Fasting glucose is a critical diabetes screening and monitoring parameter requiring accurate extraction for proper clinical assessment.

EXTRACTION PROTOCOL:
1. SYSTEMATIC ANALYSIS: Examine the document for glucose/blood sugar measurements
2. FASTING GLUCOSE PRIORITY: Specifically target fasting glucose values (most clinically relevant)
3. VALUE VERIFICATION: Ensure extracted value represents fasting blood glucose measurement
4. CLINICAL VALIDATION: Confirm value is in standard mg/dL units (typical range 70-130 mg/dL fasting)

SEARCH TERMINOLOGY (in order of clinical relevance):
• "FASTING GLUCOSE" (primary target)
• "GLUCOSE, FASTING" 
• "FASTING BLOOD GLUCOSE"
• "FASTING BLOOD SUGAR" 
• "FBG" or "FBS"
• "GLU FASTING"
• "GLUCOSE (FASTING)"
• "FASTING GLU"

CLINICAL CONSIDERATIONS:
• Prioritize FASTING glucose over random/post-prandial values
• Fasting glucose is the gold standard for diabetes screening
• Normal fasting range: 70-99 mg/dL
• Prediabetic range: 100-125 mg/dL  
• Diabetic range: ≥126 mg/dL

EXTRACTION REQUIREMENTS:
• Extract ONLY the numerical value (e.g., 95, 110.5, 82)
• Ignore reference ranges, units, or abnormal flags
• If multiple glucose values present, prioritize FASTING measurement
• Verify the value is clinically reasonable for fasting glucose

QUALITY ASSURANCE:
• Confirm the extracted value corresponds to FASTING glucose specifically
• Avoid random glucose, post-meal glucose, or glucose tolerance test values
• Double-check against the original document for accuracy

Return your findings in this exact JSON format:
{
  "glucose": <numeric_value_only>
}

CRITICAL INSTRUCTIONS:
• If FASTING GLUCOSE is clearly identified: return the numeric value
• If FASTING GLUCOSE cannot be located: return {"glucose": null}
• Do NOT include explanatory text, units, ranges, or markdown formatting
• Return ONLY the JSON object
• Prioritize clinical accuracy - this impacts diabetes assessment and patient care

Initiating clinical glucose analysis...`;

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
                text: professionalGlucosePrompt
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
      console.error('Clinical extraction API error:', errorData);
      throw new Error(`Failed to extract glucose: ${errorMessage}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    console.log('Clinical glucose extraction result:', textResponse);
    
    // Extract JSON from response
    let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      jsonMatch = textResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]];
      }
    }
    
    if (!jsonMatch) {
      throw new Error('Clinical extraction failed - no valid JSON response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    const glucose = result.glucose;
    
    // Clinical validation
    if (glucose !== null && glucose !== undefined && !isNaN(glucose) && glucose > 0) {
      // Additional clinical range validation
      if (glucose < 40 || glucose > 300) {
        console.warn(`Glucose value ${glucose} mg/dL outside typical clinical range - please verify`);
      }
      return { 
        glucose: parseFloat(glucose), 
        rawResponse: textResponse,
        clinicalNote: getGlucoseAssessment(glucose)
      };
    }
    
    return { glucose: null, rawResponse: textResponse };
  } catch (error) {
    console.error('Clinical glucose extraction error:', error);
    throw error;
  }
};

// Clinical assessment functions
const getCholesterolAssessment = (value) => {
  if (value < 200) return "Desirable level - continue current lifestyle";
  if (value < 240) return "Borderline high - lifestyle modification recommended";
  return "High cholesterol - medical evaluation and treatment consideration needed";
};

const getGlucoseAssessment = (value) => {
  if (value < 100) return "Normal fasting glucose - excellent metabolic control";
  if (value < 126) return "Prediabetic range - lifestyle intervention critical";
  return "Diabetic range - requires medical evaluation and management";
};