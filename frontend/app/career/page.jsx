"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Video,
  Code,
  ChevronRight,
  Star,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Plus,
  X,
  FileText,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  BarChart3,
  RotateCcw,
  AlertCircle,
  Menu,
  PhoneOff,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
  Layout,
  Maximize2
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const CareerHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("interview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // MOCK INTERVIEW STATE
  const [stage, setStage] = useState("setup");
  const [resume, setResume] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [savedResumes, setSavedResumes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Software Development");
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(true);
  const [currentCaption, setCurrentCaption] = useState("");
  const [stream, setStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const videoRef = useRef(null);
  const scrollRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimeoutRef = useRef(null);
  const pendingSendRef = useRef(false);
  const startListeningRef = useRef(null); 
  const stageRef = useRef(stage);
  const isHandsFreeRef = useRef(isHandsFree);

  // CODE REVIEW STATE
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({ topic: "", projectLink: "" });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Keep refs in sync
  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { isHandsFreeRef.current = isHandsFree; }, [isHandsFree]);

  // ─── SPEECH SYNTHESIS ───
  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const spokenText = text.length > 600 ? text.substring(0, 600) + "..." : text;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.05;
    utterance.onstart = () => setCurrentCaption(spokenText);
    utterance.onend = () => {
      setCurrentCaption("");
      if (isHandsFreeRef.current && stageRef.current === "interview") {
        setTimeout(() => startListeningRef.current?.(), 500); 
      }
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  // ─── DIRECT AUDIO RECORDING (REPLACING SPEECH RECOGNITION) ───
  const startListening = useCallback(async () => {
    if (!stream || stream.getAudioTracks().length === 0) {
      toast.error("Audio uplink not available. Check microphone permissions.");
      return;
    }
    window.speechSynthesis?.cancel();

    // Attempt initialization with backoff
    const attemptStart = (currentStream, currentMimeType) => {
      try {
        const options = currentMimeType ? { mimeType: currentMimeType } : {};
        const mediaRecorder = new MediaRecorder(currentStream, options);
        audioChunksRef.current = [];
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstart = () => {
          console.log(`%c[Mic] Recording Started. Final MimeType: ${mediaRecorder.mimeType || "Default"}`, "color: #00ff00");
          setIsListening(true);
        };

        mediaRecorder.onstop = async () => {
          console.log("%c[Mic] Recording Ended", "color: #ffaa00");
          setIsListening(false);
          
          if (audioChunksRef.current.length === 0) return;

          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const result = reader.result;
            // Use lastIndexOf to skip any commas in the codec string (e.g. video/webm;codecs=vp8,opus)
            const base64Audio = result.substring(result.lastIndexOf(",") + 1);
            
            // Normalize mimeType for Gemini (it expects audio/* for audio-only parts)
            let normalizedMimeType = mediaRecorder.mimeType || "audio/webm";
            if (normalizedMimeType.startsWith("video/")) {
              normalizedMimeType = normalizedMimeType.replace("video/", "audio/");
            }
            
            handleSendInterviewMessage(base64Audio, normalizedMimeType);
          };
        };

        mediaRecorder.start();
        return true;
      } catch (err) {
        console.warn(`[Mic] Failed to start with ${currentMimeType || "default"}:`, err);
        return false;
      }
    };

    // Strategy 1: Best MimeType
    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg", "audio/wav"].find(t => MediaRecorder.isTypeSupported(t));
    if (attemptStart(stream, mimeType)) return;

    // Strategy 2: Default Browser Settings
    console.log("[Mic] Strategy 2: Trying default settings...");
    if (attemptStart(stream, null)) return;

    // Strategy 3: Fresh Stream Request (Last Resort)
    console.log("[Mic] Strategy 3: Requesting fresh audio stream...");
    try {
      const freshStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (attemptStart(freshStream, null)) {
         // Optionally update the main stream state if needed
         return;
      }
    } catch (e) {
      console.error("[Mic] All recording strategies failed.", e);
      toast.error("Recording protocol failed. Check hardware connectivity.");
    }

    // Auto-stop after 30s
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = setTimeout(() => {
       if (mediaRecorderRef.current?.state === "recording") {
         stopListening();
       }
    }, 30000); 
  }, [stream]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
  }, []);

  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  useEffect(() => {
    if (pendingSendRef.current && input.trim() && !loading && !isListening) {
      pendingSendRef.current = false;
      handleSendInterviewMessage();
    }
  }, [input, isListening, loading]);

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    fetchResumes();
  }, [user]);

  useEffect(() => {
    if (activeTab === "review") fetchReviews();
  }, [activeTab]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (_) {}
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.get(`${apiUrl}/social/pending`, { withCredentials: true });
      if (res.data?.success) setPendingReviews(res.data.data);
    } catch (err) { console.error(err); } finally { setLoadingReviews(false); }
  };

  const fetchResumes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.get(`${apiUrl}/resume`, { withCredentials: true });
      if (res.data?.success) setSavedResumes(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSendInterviewMessage = async (audioData = null, audioMimeType = "audio/webm") => {
    if (!input.trim() && !audioData || loading) return;
    if (isListening) stopListening();
    window.speechSynthesis?.cancel();

    const userText = input.trim() || "[Audio Transmission]";
    const currentMessages = [...messages, { role: "user", text: userText }];
    setMessages(currentMessages);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const geminiHistory = currentMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      const res = await axios.post(`${apiUrl}/ai/interview`, {
        career: selectedCategory,
        resume: resume,
        history: geminiHistory,
        audioData: audioData,
        audioMimeType: audioMimeType
      }, { withCredentials: true });

      if (res.data?.success) {
        if (res.data.evaluation) {
          setEvaluation(res.data.evaluation);
          setStage("evaluation");
          if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
          toast.success("Intelligence Assessment Complete.");
        } else if (res.data.response) {
          setMessages((prev) => [...prev, { role: "assistant", text: res.data.response }]);
          speak(res.data.response);
          
          if (res.data.transcript) {
            setMessages(prev => {
              const newMessages = [...prev];
              // Search backwards for the last user message to update it
              for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].role === "user") {
                  newMessages[i].text = res.data.transcript;
                  break;
                }
              }
              return newMessages;
            });
          }
        }
      }
    } catch (err) { toast.error("Transmission Error."); } finally { setLoading(false); }
  };

  const handleRequestReview = async (e) => {
    e.preventDefault();
    if (!requestData.topic || !requestData.projectLink) return;
    setSubmittingRequest(true);
    try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
       const res = await axios.post(`${apiUrl}/social/request-review`, requestData, { withCredentials: true });
       if (res.data?.success) { 
          toast.success("Review Protocol Deployed."); 
          setShowRequestModal(false); 
          fetchReviews(); 
          setRequestData({ topic: "", projectLink: "" });
       }
    } catch (err) { toast.error("Deployment Failed."); } finally { setSubmittingRequest(false); }
  };

  const startInterview = async () => {
    let mediaStream = null;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      try { mediaStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true }); }
      catch (_) { toast("Text-Only Mode Activated."); }
    }

    setStage("interview");
    setMessages([]);
    setLoading(true);
    if (mediaStream) { setStream(mediaStream); setIsMicMuted(false); setIsVideoOff(!mediaStream.getVideoTracks().length); }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.post(`${apiUrl}/ai/interview`, { career: selectedCategory, resume: resume, history: [] }, { withCredentials: true });
      if (res.data?.success && res.data.response) {
        setMessages([{ role: "assistant", text: res.data.response }]);
        speak(res.data.response);
      }
    } catch (err) { setStage("setup"); toast.error("Initialization Failed."); } finally { setLoading(false); }
  };

  const resetInterview = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setStage("setup");
    setMessages([]);
    setEvaluation(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafafa] flex flex-col selection:bg-black selection:text-white">
        
        {/* PREMIUM FULL-WIDTH TOP BAR */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black">CH</div>
                 <div>
                    <h1 className="text-sm font-black text-black leading-none">Career Hub</h1>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Mission Critical Protocol</p>
                 </div>
              </div>
              
              <nav className="hidden lg:flex items-center gap-6">
                 {["interview", "review"].map((tab) => (
                    <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 border-b-2 ${
                          activeTab === tab ? "text-black border-black" : "text-gray-300 border-transparent hover:text-gray-500"
                       }`}
                    >
                       {tab === 'interview' ? 'Mock Assessment' : 'Peer Code Review'}
                    </button>
                 ))}
              </nav>
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Uplink Active</span>
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                 <Menu className="w-5 h-5" />
              </button>
           </div>
        </header>

        {/* MAIN FULL-WIDTH CONTAINER */}
        <main className="flex-1 flex flex-col w-full relative overflow-hidden">
           
           {/* INTERVIEW TAB CONTENT */}
           {activeTab === "interview" && (
              <div className="flex-1 flex flex-col min-h-0 bg-white">
                 
                 {/* STAGE: SETUP (FULL WIDTH GRID) */}
                 {stage === "setup" && (
                    <div className="flex-1 overflow-y-auto px-8 py-12">
                       <div className="max-w-7xl mx-auto space-y-12">
                          <div className="space-y-2">
                             <h2 className="text-4xl font-black text-black tracking-tight">Intelligence Briefing</h2>
                             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Configure your technical profile for real-time evaluation</p>
                          </div>

                          <div className="grid lg:grid-cols-12 gap-10">
                             {/* Resume Vector */}
                             <div className="lg:col-span-12 space-y-6">
                                <div className="bg-[#fdfdfd] border border-gray-100 rounded-[2.5rem] p-10 relative group transition-all hover:shadow-2xl hover:shadow-black/5">
                                   <div className="flex items-center justify-between mb-8">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                                            <FileText className="w-5 h-5" />
                                         </div>
                                         <h3 className="text-lg font-black text-black tracking-tight">Technical CV</h3>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                         <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Select Repository</span>
                                         <select
                                            className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase text-black focus:outline-none"
                                            onChange={(e) => setResume(e.target.value)}
                                            defaultValue=""
                                         >
                                            <option value="" disabled>Archive</option>
                                            {savedResumes.map((r) => <option key={r._id} value={r.content}>{r.name}</option>)}
                                         </select>
                                      </div>
                                   </div>

                                   <div className={`h-64 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center transition-all relative overflow-hidden ${
                                      resume ? "border-black/5 bg-gray-50/50" : "border-gray-100 hover:border-black/20 hover:bg-gray-50/30"
                                   }`}>
                                      {!resume ? (
                                         <div className="space-y-4">
                                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black border border-gray-100 shadow-xl mx-auto group-hover:scale-110 transition-transform">
                                               <Plus className="w-6 h-6" />
                                            </div>
                                            <div>
                                               <p className="text-sm font-black text-black">Upload PDF Protocol</p>
                                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Maximum technical context for AI calibration</p>
                                            </div>
                                            <input 
                                              type="file" accept=".pdf" 
                                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                              onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append("file", file);
                                                setLoading(true);
                                                try {
                                                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                                                  const res = await axios.post(`${apiUrl}/resume/upload`, formData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
                                                  if (res.data?.success) { setResume(res.data.data.content); setUploadedFileName(res.data.data.name); fetchResumes(); toast.success("CV Parsed."); }
                                                } catch (err) { toast.error("Analysis Failed."); } finally { setLoading(false); }
                                              }}
                                            />
                                         </div>
                                      ) : (
                                         <div className="w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
                                            <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-2xl flex items-center gap-6">
                                               <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shrink-0">
                                                  <FileText className="w-8 h-8 text-white" />
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-black text-black truncate">{uploadedFileName || "Target_CV.pdf"}</p>
                                                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Index Synchronized</p>
                                               </div>
                                               <button onClick={() => { setResume(""); setUploadedFileName(""); }} className="p-2 h-10 w-10 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all">
                                                  <X className="w-5 h-5" />
                                               </button>
                                            </div>
                                         </div>
                                      )}
                                   </div>
                                </div>
                             </div>

                             {/* Configuration Vector */}
                             <div className="lg:col-span-12 space-y-8">
                                <section className="bg-black text-white rounded-[2.5rem] p-10 space-y-8 flex flex-col md:flex-row items-center gap-10">
                                   <div className="flex-1 w-full">
                                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Domain Vector</h3>
                                      <select
                                         className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:bg-white/20 transition-all text-white appearance-none cursor-pointer"
                                         value={selectedCategory}
                                         onChange={(e) => setSelectedCategory(e.target.value)}
                                      >
                                         <option className="bg-black text-white">Software Development</option>
                                         <option className="bg-black text-white">AI & ML Engineering</option>
                                         <option className="bg-black text-white">DevOps Engineering</option>
                                         <option className="bg-black text-white">System Algorithms</option>
                                      </select>
                                   </div>

                                   <button
                                      disabled={!resume.trim() || loading}
                                      onClick={startInterview}
                                      className={`w-full md:w-64 h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all ${
                                         resume.trim() && !loading
                                         ? "bg-white text-black hover:bg-gray-200"
                                         : "bg-white/5 text-white/20 cursor-not-allowed"
                                      }`}
                                   >
                                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Initialize Assessment <Zap className="w-4 h-4" /></>}
                                   </button>
                                </section>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* STAGE: INTERVIEW (CINEMA MODE - FULL WIDTH) */}
                 {stage === "interview" && (
                    <div className="flex-1 flex flex-col min-h-0 bg-black relative">
                       {/* CINEMA VIDEO LAYOUT */}
                       <div className="h-[50vh] lg:h-[75vh] flex bg-[#050505] relative px-4 lg:px-8 py-4 gap-6">
                          
                          {/* AI FEED (50%) */}
                          <div className="flex-1 rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/5 relative overflow-hidden group shadow-2xl">
                             <div className="absolute inset-0 flex items-center justify-center p-12">
                                <img 
                                   src="/interview.png" 
                                   alt="AI" 
                                   className={`h-full max-h-[85%] object-contain transition-all duration-1000 ${loading || currentCaption ? "scale-105 drop-shadow-[0_0_100px_rgba(255,255,255,0.15)]" : "scale-100 opacity-70"}`} 
                                />
                             </div>
                             
                             {/* AI Label & Pulse */}
                             <div className="absolute bottom-10 left-10 flex items-center gap-4">
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">AI Interviewer</span>
                                </div>
                                {(loading || currentCaption) && (
                                   <div className="flex gap-1.5 h-6 items-end pb-1">
                                      {[1,2,3,4].map(i => (
                                         <div key={i} className={`w-1 bg-white/40 rounded-full animate-pulse`} style={{ height: `${20 + Math.random()*80}%`, animationDelay: `${i*150}ms` }} />
                                      ))}
                                   </div>
                                )}
                             </div>
                          </div>

                          {/* USER FEED (50%) */}
                          <div className="flex-1 rounded-[2.5rem] bg-gray-950 border border-white/5 relative overflow-hidden group shadow-2xl">
                             {!isVideoOff ? (
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                             ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                                      <VideoOff className="w-10 h-10" />
                                   </div>
                                   <span className="text-[9px] font-black uppercase tracking-widest text-white/20">VISUAL FEED SUPPRESSED</span>
                                </div>
                             )}
                             
                             {/* Overlay Controls */}
                             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                             
                             <div className="absolute top-10 right-10 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-md text-[9px] font-black text-white tracking-[0.2em] shadow-lg">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE STREAM
                             </div>

                             <div className="absolute bottom-10 left-10">
                                <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
                                   <div className={`w-1.5 h-1.5 rounded-full ${isVideoOff ? "bg-red-500" : "bg-green-400"}`} />
                                   You
                                </span>
                             </div>

                             <div className="absolute bottom-10 right-10 flex items-center gap-4">
                                <button onClick={() => stream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; setIsMicMuted(!t.enabled); })} className={`p-4 rounded-2xl transition-all ${isMicMuted ? "bg-red-500 text-white" : "bg-black/60 backdrop-blur-md text-white hover:bg-white hover:text-black shadow-xl"}`}>
                                   {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                                <button onClick={() => stream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; setIsVideoOff(!t.enabled); })} className={`p-4 rounded-2xl transition-all ${isVideoOff ? "bg-red-500 text-white" : "bg-black/60 backdrop-blur-md text-white hover:bg-white hover:text-black shadow-xl"}`}>
                                   {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                </button>
                             </div>
                          </div>
                       </div>

                       {/* SIMPLIFIED INTERACTIVE HUB (TRANSCRIPT & INPUT) */}
                       <div className="flex-1 bg-white rounded-t-[3rem] px-8 pt-10 mt-[-3rem] z-10 flex flex-col shadow-2xl relative border-t border-gray-100">
                          
                          {/* Minimal Transcript Area */}
                          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pb-28 scrollbar-hide max-w-4xl mx-auto w-full px-4 pt-4">
                             {messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                                   <div className={`max-w-[92%] md:max-w-2xl px-6 py-4 rounded-3xl text-base font-medium leading-relaxed transition-all shadow-sm ${
                                      m.role === "user"
                                      ? "bg-black text-white rounded-tr-none"
                                      : "bg-gray-50 text-black rounded-tl-none border border-gray-100"
                                   }`}>
                                      {m.text}
                                   </div>
                                   <div className={`flex items-center gap-2 mt-2 px-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">
                                         {m.role === 'user' ? 'Transmission' : 'AI Analysis'}
                                      </span>
                                      <div className="w-1 h-1 rounded-full bg-gray-100" />
                                      <span className="text-[8px] font-bold text-gray-200">
                                         {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                   </div>
                                </div>
                             ))}
                             {loading && (
                                <div className="flex justify-start items-center gap-3 px-2">
                                   <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 animate-pulse">
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Synchronizing...</span>
                                   </div>
                                </div>
                             )}
                          </div>

                          {/* MISSION CONTROL INPUT BAR (SIMPLIFIED) */}
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
                             <div className="bg-white border border-gray-100 p-2 rounded-2xl shadow-xl flex items-center gap-2 group focus-within:border-black transition-all">
                                <button 
                                   onClick={() => setIsHandsFree(!isHandsFree)}
                                   className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                                      isHandsFree ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'
                                   }`}
                                   title="Toggle Hands-Free Mode"
                                >
                                   {isHandsFree ? "Auto" : "Manual"}
                                </button>

                                <button 
                                   onClick={isListening ? stopListening : startListening} 
                                   className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' : 'bg-black text-white hover:bg-gray-800'}`}
                                >
                                   {isListening ? <X className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                                
                                <input 
                                   className="flex-1 bg-gray-50 border-none focus:ring-0 text-sm font-bold text-black px-5 h-12 rounded-xl placeholder:text-gray-300 placeholder:uppercase"
                                   placeholder="Transmit intelligence..."
                                   value={input}
                                   onChange={(e) => setInput(e.target.value)}
                                   onKeyDown={(e) => e.key === 'Enter' && handleSendInterviewMessage()}
                                />

                                <button 
                                   onClick={handleSendInterviewMessage}
                                   className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:scale-[1.05] transition-all shadow-xl active:scale-95 disabled:opacity-10"
                                   disabled={!input.trim() || loading}
                                >
                                   <Send className="w-5 h-5 ml-0.5" />
                                </button>

                                <div className="w-[1px] h-8 bg-gray-100 mx-1" />

                                <button onClick={resetInterview} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="End Session">
                                   <PhoneOff className="w-5 h-5" />
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* STAGE: EVALUATION (DASHBOARD - FULL WIDTH) */}
                 {stage === "evaluation" && evaluation && (
                    <div className="flex-1 overflow-y-auto bg-[#fafafa] p-12">
                       <div className="max-w-7xl mx-auto space-y-12">
                          <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-12 gap-8">
                             <div className="space-y-3">
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">Final Report</span>
                                <h2 className="text-6xl font-black text-black tracking-tighter">Performance Analysis</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assessment Cycle Validated</p>
                             </div>
                             <button onClick={resetInterview} className="px-10 py-5 bg-black text-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95">Complete Assessment Cycle</button>
                          </header>

                          <div className="grid lg:grid-cols-12 gap-10">
                             
                             {/* Metric Scoreboard */}
                             <div className="lg:col-span-8 space-y-10">
                                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                                   <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] mb-12 flex items-center gap-3">
                                      <BarChart3 className="w-4 h-4" />
                                      Intellectual Dimensions
                                   </h3>
                                   
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                      {evaluation.scores && Object.entries(evaluation.scores).map(([metric, score], i) => (
                                         <div key={metric} className="flex flex-col items-center gap-6 group">
                                            <div className="relative w-28 h-28 flex items-center justify-center">
                                               <div className="absolute inset-0 rounded-full border-4 border-gray-50" />
                                               <div className="absolute inset-0 rounded-full border-4 border-black transition-all duration-1000 rotate-[-90deg]" style={{ borderDasharray: '283', borderDashoffset: 283 - (283 * (score/100)) }} />
                                               <span className="text-2xl font-black text-black tracking-tight">{score}%</span>
                                            </div>
                                            <div className="text-center">
                                               <p className="text-[10px] font-black text-black uppercase tracking-widest">{metric.replace(/([A-Z])/g, ' $1').trim()}</p>
                                               <p className="text-[8px] font-bold text-gray-300 uppercase mt-1 tracking-tighter">{score > 80 ? 'EXPERT' : score > 50 ? 'OPERATIONAL' : 'LEARNING'}</p>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                </div>

                                <div className="bg-black text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                                   <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                                   <div className="relative z-10 space-y-8">
                                      <div className="flex items-center gap-4">
                                         <Zap className="w-8 h-8 text-white" />
                                         <h3 className="text-2xl font-black italic tracking-widest uppercase">Executive Synopsis</h3>
                                      </div>
                                      <p className="text-xl font-medium leading-relaxed opacity-90 border-l-4 border-white/20 pl-8">{evaluation.summary}</p>
                                   </div>
                                </div>
                             </div>

                             {/* Sidebar Details */}
                             <div className="lg:col-span-4 space-y-8">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                      <Star className="w-4 h-4 text-black" />
                                      Recommended Uplinks
                                   </h3>
                                   <div className="space-y-4">
                                      {evaluation.recommendations?.map((rec, i) => (
                                         <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl group hover:bg-black hover:text-white transition-all duration-500 cursor-default">
                                            <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-white/10 flex items-center justify-center shrink-0 shadow-sm font-black text-xs text-black group-hover:text-white">{i+1}</div>
                                            <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">{rec}</p>
                                         </div>
                                      ))}
                                   </div>
                                </div>

                                <div className="p-10 border-2 border-black rounded-[2.5rem] flex flex-col items-center text-center gap-6">
                                   <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl">A+</div>
                                   <div>
                                      <h4 className="text-sm font-black text-black uppercase tracking-widest">Protocol Grade</h4>
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Verified Professional Index</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           )}

           {/* CODE REVIEW TAB CONTENT (FULL WIDTH) */}
           {activeTab === "review" && (
              <div className="flex-1 overflow-y-auto bg-[#fafafa]">
                 {/* PROTOCOL ALERT BANNER */}
                 <div className="bg-red-600 px-8 py-2.5 flex items-center justify-center gap-3 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <AlertCircle className="w-4 h-4 text-white shrink-0 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">THIS FEATURE STILL ON WORK ON</span>
                    <div className="hidden md:flex items-center gap-2 ml-4">
                       <div className="w-1 h-1 rounded-full bg-white/40" />
                       <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Protocol 07-X</span>
                    </div>
                 </div>

                 <div className="px-8 py-16">
                    <div className="max-w-7xl mx-auto space-y-16">
                       <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                          <div className="space-y-4">
                             <h2 className="text-6xl font-black text-black tracking-tighter">Peer Surveillance</h2>
                             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                                <div className="w-12 h-0.5 bg-black" />
                                Synchronous Code Review Pipeline
                             </div>
                          </div>
                          <button onClick={() => setShowRequestModal(true)} className="px-10 py-5 bg-black text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
                             <Plus className="w-5 h-5" /> Initialize Protocol
                          </button>
                       </header>

                       {/* MODAL (IF OPEN) */}
                       {showRequestModal && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                             <div className="bg-white w-full max-w-xl rounded-[3rem] p-12 relative shadow-2xl overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8">
                                   <button onClick={() => setShowRequestModal(false)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 hover:text-black transition-all">
                                      <X className="w-6 h-6" />
                                   </button>
                                </div>
                                
                                <h3 className="text-3xl font-black text-black mb-10 flex items-center gap-4 italic shrink-0">
                                   <Terminal className="w-8 h-8" />
                                   Review Parameter
                                   </h3>
                                
                                <form onSubmit={handleRequestReview} className="space-y-8">
                                   <div>
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Topic / Stack</label>
                                      <input 
                                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-gray-200 focus:outline-none focus:border-black transition-all"
                                         placeholder="e.g. Next.js API Refactoring"
                                         value={requestData.topic}
                                         onChange={(e) => setRequestData({...requestData, topic: e.target.value})}
                                      />
                                   </div>
                                   <div>
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Protocol Source (GitHub)</label>
                                      <input 
                                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-gray-200 focus:outline-none focus:border-black transition-all"
                                         placeholder="https://github.com/..."
                                         value={requestData.projectLink}
                                         onChange={(e) => setRequestData({...requestData, projectLink: e.target.value})}
                                      />
                                   </div>
                                   <button
                                      type="submit"
                                      disabled={submittingRequest}
                                      className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-2xl active:scale-95"
                                   >
                                      {submittingRequest ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Deploy Sequence <ChevronRight className="w-5 h-5" /></>}
                                   </button>
                                </form>
                             </div>
                          </div>
                       )}

                       {loadingReviews ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                             {[1,2,3].map(i => (
                                <div key={i} className="bg-white/50 h-56 rounded-[2.5rem] border border-gray-100 animate-pulse" />
                             ))}
                          </div>
                       ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                             {pendingReviews.map((req) => (
                                <div key={req._id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-700 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-100 transition-opacity">
                                      <Code className="w-12 h-12 text-black" />
                                   </div>
                                   <div className="space-y-6 relative z-10">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-xs font-black">{req.user?.name?.charAt(0) || "U"}</div>
                                         <div>
                                            <p className="text-[11px] font-black text-black uppercase tracking-widest">{req.user?.name || "Unknown"}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</p>
                                         </div>
                                      </div>
                                      <div>
                                         <h4 className="text-xl font-black text-black tracking-tight leading-tight mb-2 uppercase italic">{req.topic}</h4>
                                         <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Awaiting Verification Cycle</p>
                                      </div>
                                      <a 
                                         href={req.projectLink} target="_blank"
                                         className="flex items-center justify-center gap-3 w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm group-hover:shadow-xl"
                                      >
                                         Intercept Source <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                   </div>
                                </div>
                             ))}
                             {pendingReviews.length === 0 && (
                                <div className="col-span-full py-32 flex flex-col items-center gap-6 opacity-30 select-none">
                                   <Layout className="w-16 h-16 text-gray-200" />
                                   <p className="text-xs font-black text-gray-300 uppercase tracking-[0.5em]">No Active Deployments</p>
                                </div>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           )}
        </main>

        {/* PERSISTENT PROTOCOL SYMBOL (FOOTER-ISH) */}
        <div className="fixed bottom-10 right-10 z-50 group pointer-events-none">
           <div className="flex items-center gap-6 opacity-40 group-hover:opacity-100 transition-all duration-1000 rotate-90 origin-right translate-x-12 translate-y-12">
              <span className="text-[8px] font-black text-black uppercase tracking-[0.5em] whitespace-nowrap">Integrated Intelligence Ecosystem • LevelUp Hub</span>
              <div className="w-12 h-px bg-black" />
           </div>
        </div>

      </div>
    </ProtectedRoute>
  );
};

export default CareerHub;
