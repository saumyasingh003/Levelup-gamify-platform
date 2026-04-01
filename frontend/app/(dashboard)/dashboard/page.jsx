"use client";

import React, { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import { 
  Hash, 
  Send, 
  Target, 
  Zap, 
  TrendingUp, 
  Award,
  Users,
  Search,
  Trophy,
  Medal,
  Edit2,
  Paperclip,
  Smile,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  X
} from "lucide-react";
import AIStudyBuddy from "@/components/AIStudyBuddy";
import SkillRadar from "@/components/SkillRadar";

// Mock data
const CHANNELS = [
  { id: "SD", name: "Software Development", members: 1240 },
  { id: "AI", name: "AI & ML", members: 980 },
  { id: "DEV", name: "DevOps", members: 450 },
  { id: "CP", name: "Competitive Programming", members: 2100 },
];

const INITIAL_MESSAGES = [];

// MOCK_LEADERBOARD REMOVED in favor of Live API Data

const Dashboard = () => {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const EMOJIS = ["🔥", "⭐", "🚀", "⚡", "💯", "✅", "🙌", "👋", "👏", "💻", "💡", "🎮", "🎯", "🏆"];

  // Fetch Global Leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await axios.get(`${apiUrl}/community/leaderboard`, { withCredentials: true });
        if(res.data?.success) {
          setLeaderboard(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Initialize Socket.io connection
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    socketRef.current = io(apiUrl, { withCredentials: true });

    socketRef.current.on("receive_message", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socketRef.current.on("chat_history", (history) => {
      // Ensure msg.id is present (from backend _id)
      const mappedHistory = history.map(m => ({ ...m, id: m._id || m.id }));
      setMessages(mappedHistory);
    });

    socketRef.current.on("message_updated", ({ messageId, newText }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, text: newText, isEdited: true } : m));
    });

    socketRef.current.on("online_count", ({ channelId, count }) => {
      setOnlineCount(count);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Join channel on change
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit("join_channel", activeChannel);
      setMessages([]); // Clear until history loads
    }
  }, [activeChannel]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.post(`${apiUrl}/community/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setUploadedFile({
          url: res.data.fileUrl,
          type: res.data.fileType,
          name: file.name,
        });
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = () => {
    if ((!message.trim() && !uploadedFile) || !user) return;
    
    const msgData = {
      userId: user.id || user._id,
      text: message,
      fileUrl: uploadedFile?.url || null,
      fileType: uploadedFile?.type || null,
    };

    socketRef.current.emit("send_message", {
      channelId: activeChannel,
      messageData: msgData
    });

    setMessage("");
    setUploadedFile(null);
  };

  const handleSaveEdit = (msgId) => {
    if(!editMessageText.trim()) return;

    socketRef.current.emit("update_message", {
      channelId: activeChannel,
      messageId: msgId,
      newText: editMessageText
    });

    setEditingMsgId(null);
  };

  const currentChannel = CHANNELS.find(c => c.id === activeChannel);

  const progress = user?.progress || {};
  const _lbMatch = leaderboard.find(lb => lb.id === user?.id || lb.id === user?._id);

  const highestBadge = progress.badges?.length > 0 
    ? progress.badges[progress.badges.length - 1] 
    : "Novice";

  const stats = [
    { label: "Level", value: _lbMatch?.level || progress.level || 1, icon: <Target className="w-3.5 h-3.5" /> },
    { label: "XP", value: _lbMatch?.xp || progress.xp || 0, icon: <Zap className="w-3.5 h-3.5" /> },
    { label: "Streak", value: _lbMatch?.streak || progress.streak || 1, icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { label: "Top Badge", value: _lbMatch?.badge || highestBadge, icon: <Award className="w-3.5 h-3.5" /> },
  ];

  return (
    <ProtectedRoute>
      {/* Container takes full remaining height of the viewport minus navbar */}
      <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden bg-white">
        
        {/* LEFT SIDEBAR - CHANNELS */}
        <div className="w-64 flex flex-col border-r border-gray-200 bg-gray-50/50 shrink-0">
          
          <div className="p-5 border-b border-gray-200">
            <h1 className="text-xl font-bold tracking-tight text-black">Community</h1>
            <p className="text-xs font-medium text-gray-500 mt-1">Connect with peers</p>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Career Paths
              </span>
            </div>

            <div className="space-y-0.5 px-2">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                    activeChannel === channel.id
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-200 hover:text-black"
                  }`}
                >
                  <Hash className={`w-4 h-4 shrink-0 ${activeChannel === channel.id ? "opacity-70" : "text-gray-400"}`} />
                  <span className="text-sm font-semibold truncate">
                    {channel.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* USER STATS MINI-DASHBOARD IN SIDEBAR */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="grid grid-cols-2 gap-2">
              {stats.map((stat, i) => (
                <div key={i} className="bg-gray-50 rounded-md p-2 flex flex-col gap-1 border border-gray-100">
                  <div className="flex items-center gap-1 text-gray-400">
                    {stat.icon}
                    <span className="text-[9px] font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-black truncate">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          
          {/* CHAT HEADER */}
          <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-black">{currentChannel?.name}</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Users className="w-4 h-4" />
                {onlineCount.toLocaleString()} online
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all w-48"
                />
              </div>
            </div>
          </div>

          {/* MESSAGES FEED */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            <div className="text-center py-4">
              <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-500">
                Welcome to the start of the #{currentChannel?.name} channel!
              </div>
            </div>

            {messages.filter(m => 
              (m.text || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
              (m.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
            ).map((msg) => {
               const isMe = msg.user?._id === (user?.id || user?._id) || msg.user?.name === (user?.name || user?.username);
               
               return (
                 <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
                   {/* AVATAR */}
                   <div className={`w-10 h-10 rounded-md bg-gray-900 flex items-center justify-center text-white font-bold shrink-0 uppercase ${isMe ? 'bg-black' : ''}`}>
                     {msg.user?.name?.charAt(0) || "U"}
                   </div>
 
                   {/* CONTENT */}
                   <div className={`flex flex-col flex-1 min-w-0 ${isMe ? 'items-end' : ''}`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="font-semibold text-sm text-black hover:underline cursor-pointer">
                      {msg.user?.name || "Unknown User"}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {msg.isEdited && <span className="italic ml-1">(edited)</span>}
                    </span>
                  </div>
                  
                  {msg.fileUrl && (
                    <div className="mb-2 max-w-sm rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      {msg.fileType?.startsWith("image/") ? (
                        <div className="relative group">
                          <img 
                            src={msg.fileUrl} 
                            alt="Uploaded" 
                            className="max-h-64 w-auto object-contain bg-white cursor-pointer hover:opacity-95 transition-opacity" 
                            onClick={() => window.open(msg.fileUrl, '_blank')}
                          />
                          <button 
                            className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => window.open(msg.fileUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center text-red-500">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-black truncate">Document Attached</p>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{msg.fileType?.split('/')[1] || 'PDF'}</span>
                          </div>
                          <button 
                             onClick={() => window.open(msg.fileUrl, '_blank')}
                             className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                          >
                             <ExternalLink className="w-4 h-4 text-gray-400 hover:text-black" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {editingMsgId === msg.id ? (
                    <div className="mt-1 flex flex-col gap-2 w-full max-w-3xl">
                       <input 
                         type="text"
                         value={editMessageText}
                         onChange={(e) => setEditMessageText(e.target.value)}
                         className="text-sm border border-gray-300 rounded px-3 py-1.5 w-full focus:outline-none focus:border-black bg-gray-50 text-black"
                         placeholder="Edit your message"
                         onKeyDown={(e) => {
                           if(e.key === 'Enter') handleSaveEdit(msg.id)
                           if(e.key === 'Escape') setEditingMsgId(null)
                         }}
                         autoFocus
                       />
                       <div className="flex gap-3 text-[10px] uppercase font-bold text-gray-400 mt-1">
                         <button onClick={() => setEditingMsgId(null)} className="hover:text-black transition-colors">Cancel</button>
                         <button onClick={() => handleSaveEdit(msg.id)} className="text-black hover:text-opacity-70 transition-colors">Save</button>
                       </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed max-w-3xl wrap-break-word">
                      {msg.text}
                    </p>
                  )}
                </div>

                {/* EDIT BUTTON (Only for the message author) */}
                {(msg.user?._id === (user?.id || user?._id) || msg.user?.name === (user?.name || user?.username)) && editingMsgId !== msg.id && (
                  <button 
                    onClick={() => {
                      setEditingMsgId(msg.id);
                      setEditMessageText(msg.text);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-black shrink-0 self-start mt-0.5 rounded-md hover:bg-gray-100"
                    title="Edit message"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                 </div>
               );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            {uploadedFile && (
              <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-400">
                  {uploadedFile.type.startsWith("image/") ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-black truncate">{uploadedFile.name}</p>
                   <span className="text-[10px] text-gray-400 font-medium tracking-tight">Ready to send</span>
                </div>
                <button onClick={() => setUploadedFile(null)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-4 h-4 text-gray-400 hover:text-black" />
                </button>
              </div>
            )}
            
            <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all group">
              <div className="flex items-center pl-2 gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-md transition-all"
                  disabled={isUploading}
                >
                  <Paperclip className={`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                
                <div className="relative">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 hover:bg-gray-200 rounded-md transition-all ${showEmojiPicker ? 'text-black bg-gray-200' : 'text-gray-400 hover:text-black'}`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 w-64 z-50 animate-in zoom-in-95 duration-200 origin-bottom-left">
                       <div className="grid grid-cols-7 gap-1">
                         {EMOJIS.map(e => (
                           <button 
                             key={e} 
                             onClick={() => {
                               setMessage(prev => prev + e);
                               setShowEmojiPicker(false);
                             }}
                             className="text-xl p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                           >
                             {e}
                           </button>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isUploading ? "Uploading file..." : `Message #${currentChannel?.name}`}
                className="w-full bg-transparent border-none focus:ring-0 p-3.5 min-h-[52px] max-h-[150px] resize-none text-sm text-black placeholder:text-gray-400"
                rows={1}
                disabled={isUploading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button 
                onClick={handleSendMessage}
                disabled={(!message.trim() && !uploadedFile) || isUploading}
                className={`mr-2 p-1.5 rounded-md transition-all ${
                  (message.trim() || uploadedFile) && !isUploading
                    ? "bg-black text-white hover:bg-gray-800 scale-100 shadow-lg shadow-black/10" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed scale-95"
                }`}
              >
                <Send className="w-4 h-4 ml-0.5 mb-0.5" />
              </button>
            </div>
            <p className="text-[10px] font-medium text-gray-400 mt-2 ml-1">
              <strong>Pro tip:</strong> Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for a new line.
            </p>
          </div>
        </div>

        {/* RIGHT SIDEBAR - GLOBAL LEADERBOARD */}
        <div className="w-80 border-l border-gray-200 bg-gray-50/30 flex-col shrink-0 hidden lg:flex">
          <div className="h-16 border-b border-gray-200 flex items-center px-5 shrink-0">
            <Trophy className="w-4 h-4 text-gray-400 mr-2.5" />
            <h2 className="text-sm font-bold text-black uppercase tracking-widest">Global Leaderboard</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingLeaderboard ? (
              <div className="flex justify-center items-center h-full text-xs font-bold text-gray-400 uppercase tracking-widest">
                Loading Board...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex justify-center items-center h-full text-xs font-bold text-gray-400 uppercase tracking-widest text-center px-4">
                No progress recorded yet jump into a roadmap!
              </div>
            ) : (
              leaderboard.map((lbUser, idx) => {
                const isCurrentUser = user && (user.id === lbUser.id || user._id === lbUser.id);
                return (
                  <div 
                    key={lbUser.id} 
                    className={`flex flex-col p-3 rounded-lg border ${
                      isCurrentUser 
                        ? "bg-black border-black text-white shadow-md shadow-black/10" 
                        : "bg-white border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-black ${isCurrentUser ? "text-gray-400" : "text-gray-400"}`}>
                          #{lbUser.rank}
                        </span>
                        <span className={`text-sm font-bold tracking-tight ${isCurrentUser ? "text-white" : "text-black"}`}>
                          {lbUser.name}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCurrentUser ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        <Medal className="w-3 h-3" />
                        {lbUser.badge}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="flex flex-col">
                        <span className={`text-[9px] uppercase tracking-wider font-bold mb-0.5 ${isCurrentUser ? "text-gray-400" : "text-gray-400"}`}>Level</span>
                        <span className={`text-xs font-semibold ${isCurrentUser ? "text-white" : "text-black"}`}>Lvl {lbUser.level}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[9px] uppercase tracking-wider font-bold mb-0.5 ${isCurrentUser ? "text-gray-400" : "text-gray-400"}`}>XP</span>
                        <span className={`text-xs font-semibold ${isCurrentUser ? "text-white" : "text-black"}`}>{lbUser.xp}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[9px] uppercase tracking-wider font-bold mb-0.5 ${isCurrentUser ? "text-gray-400" : "text-gray-400"}`}>Streak</span>
                        <span className={`text-xs font-semibold ${isCurrentUser ? "text-white" : "text-black"}`}>🔥 {lbUser.streak}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button className="w-full py-2 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 uppercase tracking-widest hover:border-black hover:text-black transition-colors">
              View Full Rankings
            </button>
          </div>
        </div>

        {/* AI STUDY BUDDY FLOATING SIDEBAR */}
        <AIStudyBuddy 
          context={{
            career: user?.progress?.career || "SD",
            level: user?.progress?.level || 1,
            topic: currentChannel?.name || "General"
          }} 
        />

      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
