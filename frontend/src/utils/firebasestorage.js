// src/utils/firebaseStorage.js
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Generate unique session ID
export const generateSessionId = () => {
  return `CHD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Save data to Firestore
export const saveToFirebase = async (sessionId, dataType, data) => {
  try {
    const docRef = doc(db, 'assessments', sessionId);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(docRef, {
        [dataType]: data,
        [`${dataType}_updatedAt`]: serverTimestamp()
      });
    } else {
      // Create new document
      await setDoc(docRef, {
        sessionId: sessionId,
        [dataType]: data,
        [`${dataType}_updatedAt`]: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    }
    
    console.log(`✅ Saved to Firestore [${dataType}]:`, data);
    return true;
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    throw error;
  }
};

// Get data from Firestore
export const getFromFirebase = async (sessionId, dataType) => {
  try {
    const docRef = doc(db, 'assessments', sessionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data[dataType] || null;
    }
    return null;
  } catch (error) {
    console.error('❌ Error reading from Firestore:', error);
    return null;
  }
};

// Get all data for a session
export const getAllDataFromFirebase = async (sessionId) => {
  try {
    const docRef = doc(db, 'assessments', sessionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('❌ Error reading all data:', error);
    return null;
  }
};

// Generate final 14-feature JSON for ML model
export const generateFinalJSON = async (sessionId) => {
  try {
    const allData = await getAllDataFromFirebase(sessionId);
    
    if (!allData) {
      throw new Error('No data found for this session');
    }

    const { basicDetails, advancedDetails, medicalReports } = allData;

    // 14 features for ML model
    const finalJSON = {
      'male': basicDetails?.sex === 'male' ? 1 : 0,
      'age': parseInt(basicDetails?.age) || 0,
      'cigsPerDay': parseInt(basicDetails?.cigs_per_day) || 0,
      
      
      'BPMeds': advancedDetails?.bp_meds === 'yes' ? 1 : 0,
      'prevalentStroke': advancedDetails?.prevalent_stroke === 'yes' ? 1 : 0,
      'prevalentHyp': advancedDetails?.prevalent_hyp === 'yes' ? 1 : 0,
      'diabetes': basicDetails?.diabetes === 'yes' ? 1 : 0,
      'totChol': parseFloat(medicalReports?.total_cholesterol) || 0,
      'sysBP': parseInt(advancedDetails?.systolic_bp) || 0,
      'diaBP': parseInt(advancedDetails?.diastolic_bp) || 0,
      'BMI': parseFloat(basicDetails?.bmi) || 0,
      
      'glucose': parseFloat(medicalReports?.glucose) || 0,
      'currentSmoker': basicDetails?.is_smoking === 'yes' ? 1 : 0,
    };

    // Save final JSON to Firestore
    await saveToFirebase(sessionId, 'finalJSON', finalJSON);
    await updateDoc(doc(db, 'assessments', sessionId), {
      status: 'completed',
      completedAt: serverTimestamp()
    });

    console.log('\n🎯 ===== FINAL 13-FEATURE JSON FOR ML MODEL =====');
    console.log(JSON.stringify(finalJSON, null, 2));
    console.log('=================================================\n');

    return finalJSON;
  } catch (error) {
    console.error('❌ Error generating final JSON:', error);
    throw error;
  }
};

// Save complete assessment
export const saveCompleteAssessment = async (sessionId, basicDetails, advancedDetails, medicalReports) => {
  try {
    const docRef = doc(db, 'assessments', sessionId);
    await setDoc(docRef, {
      sessionId,
      basicDetails,
      advancedDetails,
      medicalReports,
      timestamp: serverTimestamp(),
      status: 'completed'
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('❌ Error saving complete assessment:', error);
    throw error;
  }
};