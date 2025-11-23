# IPD_CHD - 10 Year Heart Disease Prediction Application

A full-stack machine learning application for predicting cardiovascular heart disease risk using patient health metrics. The application features an intuitive React frontend with interactive visualizations and a FastAPI backend powered by machine learning models with SHAP explainability.

## 🎯 Project Overview

This project combines modern web development with machine learning to provide:
- **Heart Disease Risk Prediction** - ML model predicts disease probability based on patient data
- **SHAP Explainability** - Understand which features contribute most to predictions
- **Interactive UI** - Step-by-step health data collection and results visualization
- **Firebase Integration** - Secure data storage and user authentication
- **LLM Integration** - Gives Personalized lifestyle recommendations and suggestions to improve long-term well-being

## 📁 Projet Structure

```
IPD_CHD/
├── backend/                 # Python FastAPI server
│   ├── main.py             # FastAPI endpoints (predict, explain, explain_image)
│   ├── requirements.txt     # Python dependencies
│   ├── test.py             # Unit tests
│   ├── utils_plot.py       # SHAP visualization utilities
│   ├── heart_disease_model_6pY721cT8p.pkl  # Trained ML model
│   ├── scaler_YDMGtDrnnw.pkl               # StandardScaler for feature normalization
│   └── X_train             # Training data for SHAP background
│
└── frontend/               # React + Vite application
    ├── src/
    │   ├── App.jsx         # Main app router and state management
    │   ├── main.jsx        # React entry point
    │   ├── index.css       # Global styles
    │   ├── components/     # React components
    │   │   ├── LandingPage.jsx          # Welcome screen
    │   │   ├── Screen1.jsx              # Patient demographics form
    │   │   ├── Screen2.jsx              # Medical history form
    │   │   ├── Screen3.jsx              # Review & submit data
    │   │   ├── ResultScreen.jsx         # Prediction results & SHAP chart
    │   │   ├── PredictionCard.jsx       # Risk score display
    │   │   ├── ShapBarChart.jsx         # SHAP feature importance chart
    │   │   └── Healthchatbot.jsx        # AI health assistant (Gemini)
    │   ├── utils/          # Utility functions
    │   │   ├── geminiChat.js            # Gemini API integration for chatbot
    │   │   ├── geminiExtraction.js      # Extract data from medical documents
    │   │   ├── ocr.js                   # Tesseract.js OCR implementation
    │   │   ├── firebasestorage.js       # Firebase data persistence
    │   │   ├── sessionManager.js        # Session state management
    │   │   └── debugEnv.js              # Environment debugging tools
    │   └── config/
    │       └── firebase.js              # Firebase configuration
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite bundler configuration
    ├── tailwind.config.js  # Tailwind CSS configuration
    ├── postcss.config.js   # PostCSS configuration
    └── index.html          # HTML entry point
```

## 🚀 Getting Started

### Prerequisites
- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **Google Gemini API Key** (for health chatbot - optional)
- **Firebase Project** (for data storage)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the frontend directory
   - Add your Firebase and Gemini API credentials (see `GEMINI_API_SETUP.md`)

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📋 Features

### Prediction Engine
- **Input**: 12 patient health metrics (age, BMI, cholesterol, blood pressure, etc.)
- **Output**: Binary classification (disease/no disease) with probability score
- **Model**: XGBoost/LightGBM/CatBoost ensemble
- **Features**: Includes engineered features like pulse pressure, BP ratio, and interaction terms

### SHAP Explainability
- Feature importance for individual predictions
- Visual bar charts showing contribution of each feature
- Helps clinicians understand model decisions

### Multi-Step Form
- **Screen 1**: Demographic information (age, sex, smoking status)
- **Screen 2**: Medical history (blood pressure, cholesterol, diabetes status)
- **Screen 3**: Data review and submission
- **Results**: Risk prediction with visual explanations

### Health Chatbot
- AI-powered assistant using Google Gemini
- Answers health-related questions
- Provides guidance on risk factors

### Structured Data Extraction via Generative AI
-LLM-Based Intelligent Data Extraction from complex medical documents.
-Uses semantic understanding to identify and structure clinical concepts.

### Firebase Integration
- Secure user authentication
- Cloud storage for prediction history
- Real-time data synchronization

## 🔌 API Endpoints

### FastAPI Backend

#### POST `/predict`
Predict heart disease risk for a patient.

**Request:**
```json
{
  "male": 1,
  "age": 50,
  "cigsPerDay": 0,
  "BPMeds": 0,
  "prevalentStroke": 0,
  "prevalentHyp": 1,
  "diabetes": 0,
  "totChol": 195,
  "sysBP": 120,
  "diaBP": 80,
  "BMI": 25,
  "glucose": 100,
  "currentSmoker": 0
}
```

**Response:**
```json
{
  "prediction": 0,
  "probability": 0.23,
  "features": { /* scaled features */ }
}
```

#### POST `/explain`
Get SHAP feature importance for a prediction.

**Request:** Same as `/predict`

**Response:**
```json
{
  "shap_values": {
    "age": 0.15,
    "BMI": -0.05,
    /* ... other features ... */
  },
  "features_used": { /* input features */ }
}
```

#### POST `/explain_image`
Get SHAP bar chart as PNG image.

**Request:** Same as `/predict`

**Response:** PNG image file

#### GET `/`
Health check endpoint.

## 🛠️ Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **scikit-learn** - Machine learning utilities
- **XGBoost, LightGBM, CatBoost** - Gradient boosting models
- **SHAP** - Model explainability
- **Pandas, NumPy** - Data processing
- **Joblib** - Model persistence

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Firebase** - Authentication & database
- **Tesseract.js** - OCR
- **Three.js + React Three Fiber** - 3D graphics

## 📊 Model Details

### Input Features (12)
1. Sex (male/female)
2. Age
3. Cigarettes per day
4. BP medications
5. Prevalent stroke history
6. Prevalent hypertension
7. Diabetes status
8. Total cholesterol
9. Systolic BP
10. Diastolic BP
11. BMI
12. Glucose


### Engineered Features (6)
- Pulse pressure (sysBP - diaBP)
- BP ratio (sysBP / diaBP)
- Cholesterol-BMI ratio
- Age-glucose interaction
- BP meds × hypertension interaction
- Smoker intensity (cigarettes × smoker status)

### Model Output
- **Probability**: Risk score (0-1)
- **Prediction**: Binary classification (0=no disease, 1=disease)

## 🔐 Configuration & Environment Variables

### Frontend `.env` File
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:8000
```

### Backend
- Model paths are configured in `main.py`
- CORS origins include `localhost:5173` and `localhost:3000`
- Modify origins in `main.py` for production deployment

## 📚 Documentation

- **Frontend Setup**: See `frontend/GEMINI_API_SETUP.md`
- **Troubleshooting**: See `frontend/TROUBLESHOOTING.md`
- **Alternatives**: See `frontend/FREE_ALTERNATIVES.md`

## ✅ Testing

### Backend Tests
```bash
cd backend
python test.py
```

### Frontend Build
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## 🚢 Deployment

### Backend Deployment
The FastAPI backend can be deployed to:
- **AWS EC2** / **Azure VM** - Traditional servers
- **AWS Lambda / Azure Functions** - Serverless
- **Docker** - Containerized deployment
- **Heroku** - PaaS platform

### Frontend Deployment
The React app can be deployed to:
- **Vercel** - Optimized for Vite
- **Netlify** - Continuous deployment
- **GitHub Pages** - Static hosting
- **AWS S3 + CloudFront** - Global CDN
- **Azure Static Web Apps** - Integrated CI/CD

## 📝 Development Workflow

1. **Feature Development**: Create feature branch
2. **Testing**: Run test suites
3. **Build**: Compile frontend and backend
4. **Commit**: Push changes with clear messages
5. **Deploy**: Push to main for production deployment

## 🤝 Contributing

Contributions are welcome! Please:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Add your license here]

## 📧 Contact & Support

For questions or issues, please contact the project maintainers or open an issue on the GitHub repository.

---

**Last Updated**: November 2025
**Project Status**: Active Development
