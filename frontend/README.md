# CHD Prediction Application - Frontend

A modern React-based questionnaire application for collecting patient data for Coronary Heart Disease (CHD) prediction.

## Features

- **3-Screen Questionnaire Flow:**
  1. Basic Details (Age, Sex, Weight, Height, Smoking, Diabetes)
  2. Advanced Details (BP Meds, Stroke, Hypertension, Blood Pressure)
  3. Medical Reports (OCR-enabled document upload or manual entry for Cholesterol & Glucose)

- **Hybrid AI/OCR Extraction:** 
  - Tries Gemini AI first (if API key provided) for best accuracy
  - Automatically falls back to Tesseract OCR if Gemini fails
  - Works even without API key (uses OCR only)
- **LocalStorage:** All data is saved after each screen
- **Final JSON Output:** Generates a 12-feature JSON ready for ML model input (yes/no converted to 1/0)

## Installation

1. Install dependencies:
```bash
npm install
```

2. **Set up Gemini API Key (Optional but recommended):**
   - **Without API Key:** The app will use Tesseract OCR (works offline, 100% free)
   - **With API Key:** Better accuracy with Gemini AI (free tier: 1,500 requests/day)
   - To get API key:
     - Go to https://aistudio.google.com/app/apikey
     - Sign in with your Google account
     - Click "Create API Key"
     - Copy your API key
     - Create a `.env` file in the project root:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   - **See `GEMINI_API_SETUP.md` for detailed step-by-step instructions**

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Usage

1. **Screen 1 - Basic Details:**
   - Fill in age, sex, weight, height
   - Select smoking status (if yes, enter cigarettes per day)
   - Select diabetes status
   - Click "Next" to proceed

2. **Screen 2 - Advanced Details:**
   - Answer questions about BP medication, stroke history, and hypertension
   - Enter systolic and diastolic blood pressure values
   - Click "Next" to proceed

3. **Screen 3 - Medical Reports:**
   - Upload lipid profile test image (will extract TOTAL CHOLESTEROL value using AI/OCR)
   - Upload blood sugar test image (will extract FASTING GLUCOSE or FASTING BLOOD SUGAR value)
   - OR enter values manually
   - Click "Submit & Generate JSON" to complete

## Data Storage

- All form data is automatically saved to localStorage after each screen
- Check browser console to see saved data and final JSON output
- Final JSON format: All yes/no values converted to 1/0, numeric values preserved

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Google Gemini API (for document extraction)

## Notes

- **Hybrid Extraction:** The app tries Gemini AI first (if API key provided), then automatically falls back to OCR
- **Works Without API Key:** If no Gemini API key, it uses Tesseract OCR (100% free, offline)
- Processing may take a few seconds depending on image quality
- If extraction fails, you can always enter values manually
- All data persists in localStorage even after page refresh
- **Gemini Free Tier:** 15 requests/minute, 1,500 requests/day (if using API key)
- **See `FREE_ALTERNATIVES.md` for more options**

