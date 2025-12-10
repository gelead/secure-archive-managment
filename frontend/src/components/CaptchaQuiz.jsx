import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Shield } from 'lucide-react';

const CAPTCHA_QUESTIONS = [
  {
    question: 'What is 2 + 3?',
    options: ['4', '5', '6', '7'],
    correct: 1,
  },
  {
    question: 'What color is the sky on a clear day?',
    options: ['Green', 'Blue', 'Red', 'Yellow'],
    correct: 1,
  },
  {
    question: 'How many days are in a week?',
    options: ['5', '6', '7', '8'],
    correct: 2,
  },
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correct: 2,
  },
  {
    question: 'What is 10 - 4?',
    options: ['5', '6', '7', '8'],
    correct: 1,
  },
  {
    question: 'Which is a fruit?',
    options: ['Carrot', 'Apple', 'Potato', 'Broccoli'],
    correct: 1,
  },
  {
    question: 'What is 3 × 3?',
    options: ['6', '7', '8', '9'],
    correct: 3,
  },
  {
    question: 'How many sides does a triangle have?',
    options: ['2', '3', '4', '5'],
    correct: 1,
  },
];

const CaptchaQuiz = ({ onVerify, verified }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [token, setToken] = useState(null);

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const generateNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_QUESTIONS.length);
    setCurrentQuestion(CAPTCHA_QUESTIONS[randomIndex]);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAnswerSelect = (index) => {
    if (verified) return;
    setSelectedAnswer(index);
  };

  const handleVerify = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === currentQuestion.correct;
    setIsCorrect(correct);
    setAttempts(attempts + 1);

    if (correct) {
      const verificationToken = 'captcha_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      setToken(verificationToken);
      onVerify(verificationToken);
    } else {
      setTimeout(() => {
        generateNewQuestion();
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  return (
    <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          Security Verification
        </h3>
        {!verified && (
          <button
            onClick={generateNewQuestion}
            className="text-slate-400 hover:text-white transition-colors"
            title="New question"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {verified ? (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Verification complete</span>
        </div>
      ) : (
        <>
          {currentQuestion && (
            <>
              <p className="text-white font-medium mb-4">{currentQuestion.question}</p>
              <div className="space-y-2 mb-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isCorrect !== null}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedAnswer === index
                        ? isCorrect === true
                          ? 'bg-green-900/30 border-green-600 text-green-300'
                          : isCorrect === false
                          ? 'bg-red-900/30 border-red-600 text-red-300'
                          : 'bg-blue-900/30 border-blue-600 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    } ${isCorrect !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {isCorrect === false && (
                <div className="mb-3 p-2 bg-red-900/20 border border-red-800 rounded text-red-300 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Incorrect answer. Please try again.
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={selectedAnswer === null || isCorrect !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Verify Answer
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CaptchaQuiz;

