// Debug utility to check if environment variables are loaded
export const checkGeminiAPIKey = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('=== Environment Variable Debug ===');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('API Key starts with AIzaSy:', apiKey ? apiKey.startsWith('AIzaSy') : false);
  console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('API Key (last 10 chars):', apiKey ? '...' + apiKey.substring(apiKey.length - 10) : 'NOT FOUND');
  
  // Check for common issues
  if (apiKey) {
    if (apiKey.includes('..')) {
      console.warn('⚠️ WARNING: API key contains ".." - this might be a typo!');
    }
    if (apiKey.trim() !== apiKey) {
      console.warn('⚠️ WARNING: API key has leading/trailing whitespace!');
    }
    if (apiKey.length < 30) {
      console.warn('⚠️ WARNING: API key seems too short (should be ~39 characters)');
    }
  } else {
    console.error('❌ ERROR: API key not found!');
    console.log('Make sure:');
    console.log('1. .env file exists in project root (same folder as package.json)');
    console.log('2. File contains: VITE_GEMINI_API_KEY=your_key_here');
    console.log('3. No spaces around the = sign');
    console.log('4. Dev server was restarted after creating .env');
  }
  
  return apiKey;
};

