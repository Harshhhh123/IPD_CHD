import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Screen1 from './components/Screen1';
import Screen2 from './components/Screen2';
import Screen3 from './components/Screen3';

import { createNewSession } from './utils/sessionManager';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [finalJSON, setFinalJSON] = useState(null);

  const handleGetStarted = () => {
    // Create NEW session when starting assessment
    createNewSession();
    setCurrentScreen('screen1');
  };

  const handleComplete = (jsonData) => {
    setFinalJSON(jsonData);
    setCurrentScreen('result');
  };

  const handleStartNew = () => {
    // Create NEW session for new assessment
    createNewSession();
    setFinalJSON(null);
    setCurrentScreen('screen1');
  };

  return (
    <div className="App">
      {currentScreen === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      
      {currentScreen === 'screen1' && (
        <Screen1 
          onNext={() => setCurrentScreen('screen2')}
          onBack={() => setCurrentScreen('landing')}
        />
      )}
      
      {currentScreen === 'screen2' && (
        <Screen2 
          onNext={() => setCurrentScreen('screen3')}
          onBack={() => setCurrentScreen('screen1')}
        />
      )}
      
      {currentScreen === 'screen3' && (
        <Screen3 
          onBack={() => setCurrentScreen('screen2')}
          onComplete={handleComplete}
        />
      )}
      
      {currentScreen === 'result' && (
        <ResultScreen 
          finalJSON={finalJSON}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
}

export default App;