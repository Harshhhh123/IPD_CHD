// src/App.jsx
import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import Screen1 from "./components/Screen1";
import Screen2 from "./components/Screen2";
import Screen3 from "./components/Screen3";
import ResultScreen from "./components/ResultScreen";
import { createNewSession } from "./utils/sessionManager";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [finalResult, setFinalResult] = useState(null); // will contain finalJSON + prediction + shap

  const handleGetStarted = () => {
    createNewSession();
    setCurrentScreen("screen1");
  };

  const handleComplete = (resultObject) => {
    // resultObject: { finalJSON, prediction, probability, shap_values }
    setFinalResult(resultObject);
    setCurrentScreen("result");
  };

  const handleStartNew = () => {
    createNewSession();
    setFinalResult(null);
    setCurrentScreen("screen1");
  };

  return (
    <div className="App">
      {currentScreen === "landing" && <LandingPage onGetStarted={handleGetStarted} />}

      {currentScreen === "screen1" && (
        <Screen1
          onNext={() => setCurrentScreen("screen2")}
          onBack={() => setCurrentScreen("landing")}
        />
      )}

      {currentScreen === "screen2" && (
        <Screen2 onNext={() => setCurrentScreen("screen3")} onBack={() => setCurrentScreen("screen1")} />
      )}

      {currentScreen === "screen3" && (
        <Screen3
          onBack={() => setCurrentScreen("screen2")}
          onComplete={(resultObject) => handleComplete(resultObject)}
        />
      )}

      {currentScreen === "result" && (
        <ResultScreen finalResult={finalResult} onStartNew={handleStartNew} />
      )}
    </div>
  );
};