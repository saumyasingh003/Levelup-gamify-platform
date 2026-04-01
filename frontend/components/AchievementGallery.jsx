"use client";

import React from "react";
import { Award, Lock, Medal, Star, Trophy, Target, Zap } from "lucide-react";

const AchievementGallery = ({ badges = [] }) => {
  // Common badges that could exist
  const badgeIcons = {
    "Roadmap Master": <Trophy className="w-8 h-8 text-yellow-500" />,
    "Level 1 Completer": <Target className="w-8 h-8 text-blue-500" />,
    "Adept": <Zap className="w-8 h-8 text-purple-500" />,
    "Expert": <Star className="w-8 h-8 text-orange-500" />,
    "Beginner": <Medal className="w-8 h-8 text-gray-400" />,
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Award className="w-4 h-4 text-black" />
        Achievement Gallery
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badges.length > 0 ? (
          badges.map((badge, idx) => (
            <div 
              key={badge._id || idx} 
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-black transition-all group cursor-help"
              title={badge.description}
            >
              <div className="mb-3 transform group-hover:scale-110 transition-transform">
                {badgeIcons[badge.name] || <Award className="w-8 h-8 text-black" />}
              </div>
              <span className="text-[10px] font-black text-black uppercase tracking-tight text-center leading-tight">
                {badge.name}
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-300">
            <Lock className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No achievements yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementGallery;
