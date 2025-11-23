// src/utils/sessionManager.js

const SESSION_KEY = 'chd_session_id';

export const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `CHD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const clearSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

// Create a fresh new session (clears old one)
export const createNewSession = () => {
  clearSession();
  const newSessionId = `CHD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem(SESSION_KEY, newSessionId);
  console.log('🆕 New session created:', newSessionId);
  return newSessionId;
};