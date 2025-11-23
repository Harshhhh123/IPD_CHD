// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC_KOXwPzE1Z_QjJmInqS-CFWQv7X7FDhQ",
  authDomain: "chd-prediction-75946.firebaseapp.com",
  projectId: "chd-prediction-75946",
  storageBucket: "chd-prediction-75946.firebasestorage.app",
  messagingSenderId: "949479335372",
  appId: "1:949479335372:web:0b8257663b3e61da13a969",
  measurementId: "G-57SSBCQB63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log('✅ Firebase & Firestore initialized successfully');

export { db, app, analytics };