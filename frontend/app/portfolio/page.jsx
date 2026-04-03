"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Github,
  Linkedin,
  Award,
  Zap,
  Trophy,
  Map,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Star,
  TrendingUp,
} from "lucide-react";
import AchievementGallery from "@/components/AchievementGallery";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const PortfolioPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const handleExport = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `LevelUp Portfolio - ${data?.user?.name}`,
          text: `Check out my professional growth on LevelUp!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await axios.get(`${apiUrl}/portfolio/me`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Portfolio fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-black mb-2">No Portfolio Data</h2>
        <p className="text-gray-500 max-w-xs text-sm font-medium uppercase tracking-tight">
          Complete some roadmap tasks to generate your professional portfolio.
        </p>
      </div>
    );
  }

  const { user, stats, skills, careerPaths, activity, quizHistory = [] } = data;

  const analyticalProgress = data.analyticalProgress || [];

  // Calculate Overall Quiz Completion %
  const totalQuizScore = quizHistory.reduce(
    (acc, q) => acc + q.score / q.totalQuestions,
    0,
  );
  const overallQuizPercent =
    quizHistory.length > 0
      ? Math.round((totalQuizScore / quizHistory.length) * 100)
      : 0;

  const StatusDonut = ({ value, size = 100, strokeWidth = 8, label }) => {
    const chartData = [
      { name: "Completed", value: value },
      { name: "Remaining", value: 100 - value },
    ];
    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={size / 2 - strokeWidth}
                outerRadius={size / 2}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill="#000000" />
                <Cell fill="#f3f4f6" stroke="#e5e7eb" strokeWidth={1} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-black">{value}%</span>
          </div>
        </div>
        {label && (
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
            {label}
          </span>
        )}
      </div>
    );
  };

  // Weekly data mapping
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totalWeeklyHours = Object.values(activity || {}).reduce(
    (a, b) => a + b,
    0,
  );

  const chartPoints = daysOfWeek.map((day, i) => {
    const hours = activity?.[day] || 0;
    // Scale 0-10 hours to 0-180 SVG units (higher is lower Y) - Base Y is 180, 0 is top
    const y = 180 - Math.min(hours, 10) * 16;
    return { x: 50 + i * 100, y, day, h: hours.toFixed(1) + "h" };
  });

  // SVG Path calculation
  const pathD = chartPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafafa] pb-24">
        {/* HERO HEADER */}
     <div className="relative pt-24 pb-32 px-6 overflow-hidden text-white">

  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/portfolio.jpg"
      alt="Portfolio Background"
      className="w-full h-full object-cover"
    />
    {/* Dark overlay for readability */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
  </div>

  {/* Glow Effects */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />

  {/* Content */}
  <div className="max-w-6xl mx-auto relative z-10">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">

      {/* Left */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-white/90 text-black flex items-center justify-center text-4xl font-black shadow-2xl border border-white/30 backdrop-blur-xl uppercase">
          {user.name.charAt(0)}
        </div>

        <div>
          <h1 className="text-4xl font-black tracking-tight">
            {user.name}
          </h1>

          <p className="text-white/70 font-bold uppercase tracking-widest text-sm mt-1">
            Level {stats.highestLevel} • Senior Learner
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            {user.githubLink && (
              <a
                href={user.githubLink}
                target="_blank"
                className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}

            {user.linkedinLink && (
              <a
                href={user.linkedinLink}
                target="_blank"
                className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}

            <span className="flex items-center gap-2 text-xs font-bold text-white/60">
              <Mail className="w-4 h-4" /> {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Right Buttons */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={handleExport}
          className="px-5 py-2 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-black/20"
        >
          <Download className="w-4 h-4" /> Export
        </button>

        <button
          onClick={handleShare}
          className="p-2 border border-white/30 rounded-xl text-white hover:bg-white/10 hover:scale-105 transition"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  </div>
</div>

        {/* MAIN BODY */}
        <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - PERSONAL BENCHMARKS */}
            <div className="space-y-6">
              {/* HERO STATS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:border-black transition-colors">
                  <Zap className="w-5 h-5 text-black mb-2" />
                  <span className="text-2xl font-black text-black">
                    {stats.totalXp}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Total XP
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:border-black transition-colors">
                  <Award className="w-5 h-5 text-black mb-2" />
                  <span className="text-2xl font-black text-black">
                    {stats.totalBadges}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Badges
                  </span>
                </div>
              </div>

              {/* CAREER-SPECIFIC PROFICIENCY (7 LEVELS) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-black" />
                  Proficiency
                </h3>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">
                  {careerPaths[0]?.career === "SD"
                    ? "Software Development"
                    : careerPaths[0]?.career === "AI"
                      ? "AI & ML Engineering"
                      : careerPaths[0]?.career === "DEV"
                        ? "DevOps Engineering"
                        : "Competitive Programming"}
                </p>

                <div className="space-y-5">
                  {(careerPaths[0]?.levels || []).map((lvl) => (
                    <div key={lvl.level} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">
                          Level {lvl.level}
                        </span>
                        <span className="text-[10px] font-black text-black">
                          {lvl.completed}/{lvl.total} Topics
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${lvl.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIVITY MONITOR */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-black" />
                  Commitment
                </h3>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-4xl font-black tracking-tighter text-black">
                    {Object.values(activity || {})
                      .reduce((a, b) => a + b, 0)
                      .toFixed(1)}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                    Hours This Week
                  </span>
                </div>
                <div className="flex justify-between items-end h-16 gap-1">
                  {Object.entries(activity || {}).map(([day, hrs]) => (
                    <div
                      key={day}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full bg-gray-100 rounded-sm hover:bg-black transition-colors cursor-help"
                        style={{
                          height: `${Math.min((hrs / 10) * 100, 100)}%`,
                        }}
                        title={`${day}: ${hrs}h`}
                      />
                      <span className="text-[8px] font-bold text-gray-300 uppercase">
                        {day[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MIDDLE/RIGHT COLUMN - CAREER PATHS & ACHIEVEMENTS */}
            <div className="lg:col-span-2 space-y-8">
              {/* CAREER JOURNEY (PROMOTED TO TOP) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-left">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Map className="w-4 h-4 text-black" />
                  Career Journey
                </h3>

                <div className="space-y-6">
                  {careerPaths.map((path, i) => (
                    <div
                      key={i}
                      className="group relative pl-8 pb-8 border-l-2 border-gray-100 last:pb-0 last:border-l-0"
                    >
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-black group-hover:scale-125 transition-transform" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-bold text-black group-hover:underline cursor-pointer flex items-center gap-2">
                            {path.career === "SD"
                              ? "Software Development"
                              : path.career === "AI"
                                ? "AI & ML Engineering"
                                : path.career === "DEV"
                                  ? "DevOps Engineering"
                                  : "Competitive Programming"}
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-tight mt-1">
                            Level {path.level} Accomplished •{" "}
                            {path.topicsCompleted} Topics Mastered
                          </p>
                        </div>
                        <div className="flex -space-x-2">
                          {path.badges.map((b, bi) => (
                            <div
                              key={bi}
                              className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-black shadow-sm"
                              title={b}
                            >
                              {b.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OVERALL QUIZ PROGRESS */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-black" />
                  Overall Quiz Mastery
                </h3>
                <StatusDonut
                  value={overallQuizPercent}
                  size={160}
                  strokeWidth={12}
                  label="Mastery Score"
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-4 max-w-[200px]">
                  Aggregate performance status across all historical technical
                  assessments.
                </p>
              </div>

              {/* FULL GALLERY */}
              <AchievementGallery
                badges={careerPaths.flatMap((path) =>
                  path.badges.map((b) => ({ name: b })),
                )}
              />

              {/* NEW: 7-LEVEL ANALYTICAL COMPONENTS */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
                <div className="mb-10 text-center">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-black" />
                    Cognitive Growth Index
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Professional benchmarking across 7 analytical progression
                    levels.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                  {analyticalProgress.map((lvl, i) => (
                    <StatusDonut
                      key={i}
                      value={lvl.value}
                      size={90}
                      strokeWidth={8}
                      label={lvl.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PortfolioPage;
