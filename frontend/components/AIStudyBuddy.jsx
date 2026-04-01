"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageSquare, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const AIStudyBuddy = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI Study Buddy. Stuck on a topic? Ask me anything!" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    // Initial assistant message for streaming
    setMessages(prev => [...prev, { role: "assistant", text: "" }]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/ai/buddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: currentInput,
          context,
          history: messages.map(m => ({ 
            role: m.role === "assistant" ? "model" : "user", 
            parts: [{ text: m.text }] 
          }))
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;
        
        // Update the last message (the assistant one) with fresh chunk
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = accumulatedResponse;
          return newMessages;
        });
      }
      
      console.log("%c[AI Buddy] Stream completed", "color: #00ff00; font-weight: bold");
    } catch (err) {
      console.error("%c[AI Buddy] Error:", "color: #ff0000; font-weight: bold", err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = "Sorry, I encountered an error during transmission.";
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50 group overflow-hidden border-2 border-white/20"
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <Bot className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 w-80 md:w-96 bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-tight">AI Study Buddy</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Beta v1.0 • Expert Guidance</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-black text-white rounded-br-none' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-slate prose-sm max-w-none text-[11px]! leading-snug">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-black" />
                  <span className="text-[10px] uppercase font-black text-gray-400">Thinking...</span>
               </div>
            </div>
          )}
        </div>

        {/* User Input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a topic..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-[11px] font-semibold focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`absolute right-2 p-2 rounded-lg transition-all ${input.trim() && !loading ? 'bg-black text-white hover:bg-gray-800' : 'text-gray-300'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] font-bold text-gray-400 mt-2 text-center uppercase tracking-widest">
            Powered by Gemini AI • Context-Aware
          </p>
        </div>
      </div>
    </>
  );
};

export default AIStudyBuddy;
