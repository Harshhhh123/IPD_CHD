// src/components/HealthChatBot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInitialRecommendations, chatWithGemini } from '../utils/geminiChat';

const HealthChatBot = ({ isOpen, onClose, userData, shapValues, probability }) => {
  const [phase, setPhase] = useState('loading'); // 'loading', 'recommendations', 'chat'
  const [recommendations, setRecommendations] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Generate initial recommendations when modal opens
  useEffect(() => {
    if (isOpen && phase === 'loading') {
      generateRecommendations();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const generateRecommendations = async () => {
    try {
      setError(null);
      const recs = await generateInitialRecommendations(userData, shapValues, probability);
      setRecommendations(recs);
      setPhase('recommendations');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError('Unable to generate personalized recommendations. Please try again.');
      setPhase('error');
    }
  };

  const startChat = () => {
    setPhase('chat');
    // Add initial AI message to start the conversation
    setChatHistory([
      {
        role: 'assistant',
        content: "I'm here to help you with any questions about your health recommendations or cardiovascular wellness. What would you like to know more about?",
        timestamp: new Date()
      }
    ]);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    // Add user message to history immediately
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentMessage('');
    
    // Show typing indicator immediately
    setIsTyping(true);

    try {
      // Get AI response
      const aiResponse = await chatWithGemini(
        currentMessage, 
        chatHistory, 
        userData, 
        shapValues
      );

      // Small delay to feel natural (but not too long)
      await new Promise(resolve => setTimeout(resolve, 800));

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = {
        role: 'assistant',
        content: error.message.includes('API key') 
          ? '🔑 Please update your API key and refresh the page.'
          : 'I apologize for the technical issue. Please try asking again.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const RecommendationCard = ({ title, items }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
    >
      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-blue-800 text-sm flex items-start gap-2">
            <span className="text-blue-400 mt-1.5 text-xs">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );

  const ChatMessage = ({ message, index, isNew }) => (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      {message.role === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
      )}
      
      <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : ''}`}>
        <div className={`p-4 rounded-2xl ${
          message.role === 'user' 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white ml-auto' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <p className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
            {message.content}
          </p>
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {message.role === 'user' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Personalized Health Assistant</h2>
                  <p className="text-indigo-100 text-sm">
                    {phase === 'loading' && 'Getting your recommendations ready...'}
                    {phase === 'recommendations' && 'Your personalized health recommendations'}
                    {phase === 'chat' && 'Ask me anything about your health'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Loading State */}
            {phase === 'loading' && (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Health Data</h3>
                  <p className="text-gray-600 mb-8">
                    Our AI is creating personalized recommendations based on your risk factors...
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {phase === 'error' && (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => { setPhase('loading'); generateRecommendations(); }}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Display */}
            {phase === 'recommendations' && recommendations && (
              <div className="flex-1 overflow-y-auto p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto space-y-8"
                >
                  {/* Greeting */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <p className="text-green-900 font-medium leading-relaxed">{recommendations.greeting}</p>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Key Insights
                    </h3>
                    <div className="space-y-3">
                      {recommendations.keyInsights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200"
                        >
                          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <p className="text-amber-900 text-sm leading-relaxed">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Your Personalized Action Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(recommendations.recommendations).map(([key, section], index) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        >
                          <RecommendationCard title={section.title} items={section.items} />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Priority Actions */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
                    <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Priority Actions
                    </h3>
                    <div className="space-y-3">
                      {recommendations.priorityActions.map((action, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <p className="text-red-900 text-sm font-medium leading-relaxed">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Encouragement */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                    <p className="text-purple-900 font-medium leading-relaxed text-center">{recommendations.encouragement}</p>
                  </div>

                  {/* Start Chat Button */}
                  <div className="text-center pt-6">
                    <button
                      onClick={startChat}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Ask Questions • Get More Guidance
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Chat Interface */}
            {phase === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Quick Action Buttons */}
                {chatHistory.length === 1 && (
                  <div className="border-b border-gray-200 p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "What foods should I avoid?",
                        "Best exercises for me?", 
                        "How to lower my BP?",
                        "When to see a doctor?"
                      ].map((question, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentMessage(question);
                            setTimeout(() => sendMessage(), 100);
                          }}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                  {chatHistory.map((message, index) => (
                    <ChatMessage 
                      key={`${message.timestamp.getTime()}-${index}`}
                      message={message} 
                      index={index}
                      isNew={index >= chatHistory.length - 1}
                    />
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="bg-gray-100 rounded-2xl p-4 max-w-[200px]">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-6">
                  <div className="flex gap-3">
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about diet, exercise, medications, or any health concerns..."
                      className="flex-1 resize-none border border-gray-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows="2"
                      disabled={isTyping}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim() || isTyping}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-4 rounded-2xl transition-all duration-200 flex items-center justify-center min-w-[60px]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HealthChatBot;