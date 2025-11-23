// src/utils/hybridExtraction.js
// Hybrid approach: Try Gemini first, fallback to Tesseract OCR

import { extractCholesterolWithGemini, extractGlucoseWithGemini } from './geminiExtraction';
import { processLipidProfile, processBloodSugarTest } from './ocr';

/**
 * Extract cholesterol with hybrid approach:
 * 1. Try Gemini AI (more accurate)
 * 2. If fails, try Tesseract OCR (fallback)
 * 3. If both fail, return null
 */
export const extractCholesterolHybrid = async (file) => {
  let result = null;
  let method = 'none';

  // Try Gemini first (if API key exists)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (apiKey) {
    try {
      console.log('Attempting Gemini extraction for cholesterol...');
      const geminiResult = await extractCholesterolWithGemini(file);
      if (geminiResult.cholesterol) {
        result = geminiResult.cholesterol;
        method = 'gemini';
        console.log('✓ Gemini extraction successful:', result);
        return { cholesterol: result, method: 'gemini' };
      }
    } catch (error) {
      console.warn('Gemini extraction failed, trying OCR fallback:', error.message);
    }
  } else {
    console.log('No Gemini API key found, using OCR directly...');
  }

  // Fallback to Tesseract OCR
  try {
    console.log('Attempting OCR extraction for cholesterol...');
    const ocrResult = await processLipidProfile(file);
    if (ocrResult.cholesterol) {
      result = ocrResult.cholesterol;
      method = 'ocr';
      console.log('✓ OCR extraction successful:', result);
      return { cholesterol: result, method: 'ocr' };
    }
  } catch (error) {
    console.error('OCR extraction also failed:', error);
  }

  // Both methods failed
  console.log('Both extraction methods failed');
  return { cholesterol: null, method: 'none' };
};

/**
 * Extract glucose with hybrid approach:
 * 1. Try Gemini AI (more accurate)
 * 2. If fails, try Tesseract OCR (fallback)
 * 3. If both fail, return null
 */
export const extractGlucoseHybrid = async (file) => {
  let result = null;
  let method = 'none';

  // Try Gemini first (if API key exists)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (apiKey) {
    try {
      console.log('Attempting Gemini extraction for glucose...');
      const geminiResult = await extractGlucoseWithGemini(file);
      if (geminiResult.glucose) {
        result = geminiResult.glucose;
        method = 'gemini';
        console.log('✓ Gemini extraction successful:', result);
        return { glucose: result, method: 'gemini' };
      }
    } catch (error) {
      console.warn('Gemini extraction failed, trying OCR fallback:', error.message);
    }
  } else {
    console.log('No Gemini API key found, using OCR directly...');
  }

  // Fallback to Tesseract OCR
  try {
    console.log('Attempting OCR extraction for glucose...');
    const ocrResult = await processBloodSugarTest(file);
    if (ocrResult.glucose) {
      result = ocrResult.glucose;
      method = 'ocr';
      console.log('✓ OCR extraction successful:', result);
      return { glucose: result, method: 'ocr' };
    }
  } catch (error) {
    console.error('OCR extraction also failed:', error);
  }

  // Both methods failed
  console.log('Both extraction methods failed');
  return { glucose: null, method: 'none' };
};

