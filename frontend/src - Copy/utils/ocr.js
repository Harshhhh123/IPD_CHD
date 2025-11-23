import { createWorker } from 'tesseract.js';

// Extract numeric values from OCR text with improved pattern matching
const extractNumericValue = (text, keywords, isTableFormat = false) => {
  const lines = text.split('\n');
  
  // First, try to find in table format (TEST | VALUE | UNIT | REFERENCE)
  if (isTableFormat) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      for (const keyword of keywords) {
        if (line.includes(keyword.toLowerCase())) {
          // Look for value in the same line
          // Pattern: "TOTAL CHOLESTEROL" followed by numbers, or "VALUE: 180"
          const currentLine = lines[i];
          
          // Try to find "VALUE:" pattern first
          const valueMatch = currentLine.match(/value\s*:?\s*(\d+\.?\d*)/i);
          if (valueMatch) {
            const value = parseFloat(valueMatch[1]);
            if (value >= 50 && value <= 500) {
              return value;
            }
          }
          
          // Extract all numbers from the line
          const numbers = currentLine.match(/\d+\.?\d*/g);
          if (numbers && numbers.length > 0) {
            // Filter for reasonable values (cholesterol: 50-500, glucose: 50-500)
            for (const num of numbers) {
              const value = parseFloat(num);
              if (value >= 50 && value <= 500) {
                return value;
              }
            }
            // If no value in range, return first reasonable number
            return parseFloat(numbers[0]);
          }
          
          // Check next line if current line doesn't have numbers
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextValueMatch = nextLine.match(/value\s*:?\s*(\d+\.?\d*)/i);
            if (nextValueMatch) {
              const value = parseFloat(nextValueMatch[1]);
              if (value >= 50 && value <= 500) {
                return value;
              }
            }
            
            const nextNumbers = nextLine.match(/\d+\.?\d*/g);
            if (nextNumbers && nextNumbers.length > 0) {
              for (const num of nextNumbers) {
                const value = parseFloat(num);
                if (value >= 50 && value <= 500) {
                  return value;
                }
              }
              return parseFloat(nextNumbers[0]);
            }
          }
        }
      }
    }
  }
  
  // Fallback: search all lines
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    for (const keyword of keywords) {
      if (lowerLine.includes(keyword.toLowerCase())) {
        // Try "VALUE:" pattern first
        const valueMatch = line.match(/value\s*:?\s*(\d+\.?\d*)/i);
        if (valueMatch) {
          const value = parseFloat(valueMatch[1]);
          if (value >= 50 && value <= 500) {
            return value;
          }
        }
        
        // Extract numbers from the line
        const numbers = line.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          // Filter for reasonable values
          for (const num of numbers) {
            const value = parseFloat(num);
            if (value >= 50 && value <= 500) {
              return value;
            }
          }
          return parseFloat(numbers[0]);
        }
      }
    }
  }
  return null;
};

// Extract cholesterol value from OCR text
export const extractCholesterol = (text) => {
  // Primary keywords for lipid profile reports
  const keywords = [
    'total cholesterol',
    'total chol',
    'cholesterol',
    'chol'
  ];
  
  // Try table format first (common in lab reports)
  let value = extractNumericValue(text, keywords, true);
  if (value) return value;
  
  // Fallback to general search
  return extractNumericValue(text, keywords, false);
};

// Extract glucose value from OCR text
export const extractGlucose = (text) => {
  // Primary keywords for blood sugar reports
  const keywords = [
    'fasting blood sugar',
    'fasting glucose',
    'blood sugar fasting',
    'fbs',
    'fasting',
    'glucose'
  ];
  
  // Try table format first (common in lab reports)
  let value = extractNumericValue(text, keywords, true);
  if (value) return value;
  
  // Fallback to general search
  return extractNumericValue(text, keywords, false);
};

// Perform OCR on image file
export const performOCR = async (file) => {
  try {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
};

// Process lipid profile for cholesterol
export const processLipidProfile = async (file) => {
  try {
    const ocrText = await performOCR(file);
    console.log('OCR Text from Lipid Profile:', ocrText);
    const cholesterol = extractCholesterol(ocrText);
    return { cholesterol, ocrText };
  } catch (error) {
    console.error('Error processing lipid profile:', error);
    throw error;
  }
};

// Process blood sugar test for glucose
export const processBloodSugarTest = async (file) => {
  try {
    const ocrText = await performOCR(file);
    console.log('OCR Text from Blood Sugar Test:', ocrText);
    const glucose = extractGlucose(ocrText);
    return { glucose, ocrText };
  } catch (error) {
    console.error('Error processing blood sugar test:', error);
    throw error;
  }
};

