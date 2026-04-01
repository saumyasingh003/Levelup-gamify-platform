"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, Trophy } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const QuizModule = ({ topic, career, level, onClose, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await axios.post(`${apiUrl}/ai/quiz`, {
          topic, career, level
        }, { withCredentials: true });
        
        if (res.data?.success) {
          setQuestions(res.data.data);
        }
      } catch (err) {
        toast.error("Failed to load quiz. AI might be busy!");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [topic]);

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelectedIdx(idx);
    setShowFeedback(true);
    if (idx === questions[currentIdx].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setShowFeedback(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setFinished(true);
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.post(`${apiUrl}/quiz/submit`, {
        score,
        totalQuestions: questions.length,
        roadmapNodeId: topic
      }, { withCredentials: true });
      
      toast.success(`Quiz Complete! Scored ${score}/${questions.length}`);
      if (onComplete) onComplete(score, res.data.progress);
    } catch (err) {
      console.error("Quiz submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col items-center max-w-sm w-full shadow-2xl animate-in zoom-in-95">
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-black mb-4" />
          <h3 className="text-xs md:text-sm font-bold text-black uppercase tracking-tight">AI Generating Quiz...</h3>
          <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 text-center leading-relaxed">Preparing professional assessment for "{topic}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100">
          <div 
             className="h-full bg-black transition-all duration-500" 
             style={{ width: `${((currentIdx + (finished ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <div className="p-5 md:p-10 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-6 md:mb-10">
            <div>
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</span>
              <h3 className="text-lg md:text-xl font-bold text-black mt-1 uppercase tracking-tight">Assessment</h3>
            </div>
            <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
            </button>
          </div>

          {!finished ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h4 className="text-base md:text-lg font-bold text-gray-800 mb-6 md:mb-8 leading-tight">
                {questions[currentIdx]?.question}
              </h4>

              <div className="space-y-3">
                {questions[currentIdx]?.options.map((opt, i) => {
                  const isCorrect = i === questions[currentIdx].correctIndex;
                  const isSelected = i === selectedIdx;
                  
                  let stateStyle = "border-gray-100 hover:border-black hover:bg-gray-50";
                  if (showFeedback) {
                    if (isCorrect) stateStyle = "border-green-500 bg-green-50 text-green-700";
                    else if (isSelected) stateStyle = "border-red-500 bg-red-50 text-red-700";
                    else stateStyle = "border-gray-100 opacity-50";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={showFeedback}
                      className={`w-full p-3.5 md:p-4 rounded-xl border-2 text-left text-[13px] md:text-sm font-bold transition-all flex items-center justify-between group ${stateStyle}`}
                    >
                      <span>{opt}</span>
                      {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {showFeedback && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in zoom-in-95">
                  <p className="text-xs font-bold text-black leading-relaxed">
                    <span className="uppercase text-gray-400 mr-2">Explanation:</span>
                    {questions[currentIdx]?.explanation}
                  </p>
                  <button 
                    onClick={nextQuestion}
                    className="mt-6 w-full py-4 bg-black text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                  >
                    {currentIdx === questions.length - 1 ? "Check Results" : "Next Question"}
                    <ArrowRight className="w-4 h-4 mt-0.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 md:py-10 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl">
                <Trophy className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight mb-2">Quiz Complete!</h3>
              <p className="text-gray-500 text-[10px] md:text-xs font-bold mb-8 md:mb-10 uppercase tracking-widest">You Scored {score} out of {questions.length}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">XP Earned</span>
                    <span className="text-xl font-bold text-black">+{score * 10}</span>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Accuracy</span>
                    <span className="text-xl font-bold text-black">{Math.round((score / questions.length) * 100)}%</span>
                 </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-2xl shadow-black/20"
              >
                Continue Adventure
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-5 md:px-8 py-3 md:py-4 flex items-center justify-center gap-2 border-t border-gray-100 shrink-0">
          <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-black" />
          <span className="text-[8px] md:text-[10px] font-black text-black uppercase tracking-widest leading-none">AI-Adaptive Professional Assessment</span>
        </div>
      </div>
    </div>
  );
};

export default QuizModule;
