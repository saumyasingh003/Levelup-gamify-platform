"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import axios from "axios";
import { CheckCircle2, Circle, PartyPopper, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const RoadmapAccordion = ({ roadmap = [], career, progress, onUpdate }) => {
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [openLevel, setOpenLevel] = useState(null);
  const [isToggling, setIsToggling] = useState(null); // track which topic is being toggled

  const toggleTopic = async (levelNum, topicIdx) => {
    const topicKey = `${levelNum}-${topicIdx}`;
    setIsToggling(topicKey);
    try {
      const res = await axios.post(
        "http://localhost:5000/progress/toggle",
        { level: levelNum, topicIndex: topicIdx },
        { withCredentials: true },
      );

      const updatedProgress = res.data?.progress;

      if (res.data.leveledUp) {
        setLevelUpData({
          newLevel: res.data.progress.level,
          isFinal: res.data.isFinal,
        });
        setShowLevelUp(true);
        if (!res.data.isFinal) {
          setOpenLevel(String(res.data.progress.level));
        }
        setTimeout(() => setShowLevelUp(false), 4000);
      }

      if (onUpdate) onUpdate(updatedProgress);
    } catch (error) {
      console.error("Failed to toggle topic", error);
      toast.error("Failed to update progress. Please check your connection.");
    } finally {
      setIsToggling(null);
    }
  };

  const careerLabels = {
    SD: "Software Development",
    AI: "AI & ML",
    DEV: "DevOps",
    CP: "Competitive Programming",
  };

  const visibleLevels = showAllLevels ? roadmap : roadmap.slice(0, 3);

  // Auto-open current level on load or level change
  useEffect(() => {
    if (progress?.level != null) {
      setOpenLevel(String(progress.level));
    }
  }, [progress?.level]);

  return (
    <div className="w-full text-left">
      {/* HEADER */}
      <div className="mb-5 flex items-center gap-2">
        <h2 className="text-2xl font-bold text-black">Career Path:</h2>
        <p className="text-gray-800 text-lg">
          {careerLabels[career] || career}
        </p>
      </div>

      {/* ACCORDION */}
      <Accordion
        type="single"
        collapsible
        className="space-y-3"
        value={openLevel ?? ""}
        onValueChange={(val) => setOpenLevel(val === "" ? null : String(val))}
      >
        {visibleLevels.map((level) => {
          const total = level.topics.length;
          const done = level.topics.filter((_, i) =>
            progress?.completedTopics?.includes(`${level.level}-${i}`),
          ).length;
          const progressPercent = Math.round((done / total) * 100) || 0;

          return (
            <AccordionItem
              key={level.level}
              value={String(level.level)}
              className="border border-black/10 rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="bg-black text-white px-4 py-3 text-sm font-semibold flex flex-col items-start gap-1">
                <div className="flex justify-between w-full">
                  <span>
                    Level {level.level} — {level.title}
                  </span>

                  <span className="text-xs text-gray-300">
                    {progressPercent}%
                  </span>
                </div>

                <div className="w-full h-0.5 bg-white/20">
                  <div
                    className="h-0.5 bg-white transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </AccordionTrigger>

              <AccordionContent className="bg-gray-50 px-4 py-3">
                <div className="space-y-2">
                  {level.topics.map((topic, index) => {
                    const key = `${level.level}-${index}`;
                    const isDone = progress?.completedTopics?.includes(key);

                    return (
                      <div
                        key={index}
                        onClick={() =>
                          !isToggling && toggleTopic(level.level, index)
                        }
                        className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                          isToggling === key ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        {isToggling === key ? (
                          <Loader2 className="w-4 h-4 text-black animate-spin" />
                        ) : isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-black animate-in zoom-in duration-300" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}

                        <span
                          className={`text-sm ${
                            isDone
                              ? "line-through text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {topic}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* SHOW MORE */}
      {roadmap.length > 3 && (
        <button
          onClick={() => setShowAllLevels((prev) => !prev)}
          className="mt-5 mb-4 px-4 py-2 rounded-md text-sm bg-gray-100 border border-gray-200 hover:bg-gray-200 transition"
        >
          {showAllLevels ? "Show Less" : "Show More Levels"}
        </button>
      )}
      {/* LEVEL UP POPUP */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col items-center animate-in zoom-in-95 duration-500 max-w-sm mx-4 text-center relative overflow-hidden border border-gray-200">
            {/* soft colorful glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-pink-400 via-yellow-300 to-blue-400 opacity-20 blur-3xl rounded-full" />

            {/* colorful icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-yellow-300 to-blue-400 blur-xl rounded-full opacity-40 scale-125" />
              <div className="p-4 rounded-full bg-white shadow-md relative z-10 border border-gray-100">
                <PartyPopper className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-500 animate-bounce" />
              </div>
            </div>

            {/* heading */}
            <h2 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
              {levelUpData?.isFinal ? "Roadmap Complete! 🏆" : "Level Up 🎉"}
            </h2>

            {/* description */}
            <p className="text-gray-600 text-lg mb-6">
              {levelUpData?.isFinal ? (
                <>
                  You've mastered the{" "}
                  <span className="font-bold text-black border-b-2 border-black">
                    {careerLabels[career] || career}
                  </span>{" "}
                  path!
                </>
              ) : (
                <>
                  You've reached{" "}
                  <span className="font-bold text-black border-b-2 border-black">
                    Level {levelUpData?.newLevel}
                  </span>
                </>
              )}
            </p>

            {/* divider */}
            <div className="w-16 h-[2px] bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400 rounded-full mb-6" />

            {/* stats */}
            <div className="flex gap-4 w-full">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 hover:shadow-md transition">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  XP Gained
                </p>
                <p className="text-xl font-bold text-black">+100 XP</p>
              </div>

              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 hover:shadow-md transition">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Badge
                </p>
                <p className="text-xl font-bold text-black">Unlocked</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapAccordion;
