"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Career-specific skill mappings
const careerSkillMap = {
  SD: [
    { label: "Frontend", key: "frontend" },
    { label: "Backend", key: "backend" },
    { label: "DSA", key: "dsa" },
    { label: "DevOps", key: "devops" },
    { label: "Soft Skills", key: "softSkills" },
    { label: "AI Tools", key: "ai" },
  ],
  AI: [
    { label: "AI & ML", key: "ai" },
    { label: "DSA", key: "dsa" },
    { label: "Backend", key: "backend" },
    { label: "Frontend", key: "frontend" },
    { label: "DevOps", key: "devops" },
    { label: "Soft Skills", key: "softSkills" },
  ],
  DEV: [
    { label: "DevOps", key: "devops" },
    { label: "Backend", key: "backend" },
    { label: "Cloud & Infra", key: "ai" },
    { label: "Frontend", key: "frontend" },
    { label: "DSA", key: "dsa" },
    { label: "Soft Skills", key: "softSkills" },
  ],
  CP: [
    { label: "DSA", key: "dsa" },
    { label: "Problem Solving", key: "frontend" },
    { label: "Logic", key: "backend" },
    { label: "Math", key: "ai" },
    { label: "Optimization", key: "devops" },
    { label: "Soft Skills", key: "softSkills" },
  ],
};

const careerLabels = {
  SD: "Software Development",
  AI: "AI & Machine Learning",
  DEV: "DevOps Engineering",
  CP: "Competitive Programming",
};

const SkillRadar = ({ skills, career }) => {
  const mapping = careerSkillMap[career] || careerSkillMap.SD;
  const careerName = careerLabels[career] || "Your Path";

  const raw = {};
  mapping.forEach((m) => {
    raw[m.label] = skills?.[m.key] || 0;
  });

  // Dynamic max so the chart scales nicely
  const maxVal = Math.max(...Object.values(raw), 1);
  const fullMark = Math.ceil(maxVal * 1.25);

  const data = mapping.map((m) => ({
    subject: m.label,
    value: skills?.[m.key] || 0,
    fullMark,
  }));

  const hasData = Object.values(raw).some((v) => v > 0);

  return (
    <div className="w-full bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
        <span className="w-2 h-2 bg-black rounded-full"></span>
        Skill Distribution
      </h3>
      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2 pl-4">
        {careerName}
      </p>

      {!hasData ? (
        <div className="h-[260px] flex flex-col items-center justify-center text-center">
          <p className="text-gray-300 text-3xl mb-2">📊</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No data yet</p>
          <p className="text-[10px] text-gray-400 mt-1">Complete topics &amp; quizzes to build your skill profile</p>
        </div>
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#374151", fontSize: 11, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, fullMark]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Skills"
                dataKey="value"
                stroke="#000000"
                strokeWidth={2}
                fill="#000000"
                fillOpacity={0.12}
                dot={{ r: 3, fill: "#000", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#000", stroke: "#fff", strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(val) => [`${val} pts`, ""]}
                labelFormatter={(label) => label}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Skill breakdown row */}
      {hasData && (
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
          {data.map((d) => (
            <div key={d.subject} className="text-center">
              <p className="text-lg font-black text-black">{d.value}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{d.subject}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillRadar;
