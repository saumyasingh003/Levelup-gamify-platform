"use client";

import { Award, Zap, Target, TrendingUp } from "lucide-react";

const InfoCards = ({ progress }) => {
  const safe = {
    level: progress?.level ?? 0,
    xp: progress?.xp ?? 0,
    streak: progress?.streak ?? 0,
    badges: progress?.badges ?? [],
  };

  const stats = [
    { label: "Level", value: safe.level, icon: <Target className="w-4 h-4 text-white" /> },
    { label: "XP", value: safe.xp, icon: <Zap className="w-4 h-4 text-white" /> },
    { label: "Streak", value: safe.streak, icon: <TrendingUp className="w-4 h-4 text-white" /> },
    { label: "Badges", value: safe.badges.length, icon: <Award className="w-4 h-4 text-white" /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-full lg:max-w-md ml-auto">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="border border-gray-200 bg-white rounded-lg p-5 flex flex-col justify-between transition-colors hover:border-black"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {stat.label}
            </span>
            <div className="p-1.5 bg-black rounded-md">
              {stat.icon}
            </div>
          </div>
          <div className="text-2xl font-bold text-black tracking-tight">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoCards;