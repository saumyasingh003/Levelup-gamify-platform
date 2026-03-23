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
    { label: "Level", value: safe.level, icon: <Target /> },
    { label: "XP", value: safe.xp, icon: <Zap /> },
    { label: "Streak", value: safe.streak, icon: <TrendingUp /> },
    { label: "Badges", value: safe.badges.length, icon: <Award /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="border border-black rounded-lg px-4 py-3 flex justify-between"
        >
          <div className="flex gap-2 items-center text-sm">
            {stat.icon}
            {stat.label}
          </div>
          <div className="text-xl font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default InfoCards;