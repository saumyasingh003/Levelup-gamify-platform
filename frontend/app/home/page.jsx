"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

import InfoCards from "@/components/InfoCards";
import CareerPopup from "@/components/CareerPopup";
import RoadmapLoader from "@/components/RoadmapLoader";
import RoadmapAccordion from "@/components/RoadmapAccordion";
import TodoPlanner from "@/components/TodoPlanner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { User, Briefcase, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

const Home = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [career, setCareer] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activeLevel, setActiveLevel] = useState(1); // the level currently open/selected for tasks
  const [progress, setProgress] = useState(null);

  const handleProgressUpdate = (updatedProgress) => {
    if (!updatedProgress) return;
    setCareer(updatedProgress.career);
    setCurrentLevel(updatedProgress.level ?? 1);
    setActiveLevel(updatedProgress.level ?? 1);
    setProgress(updatedProgress);
  };

  const fetchRoadmap = async () => {
    try {
      setLoadingRoadmap(true);

      const res = await api.get("/roadmap");

      setRoadmap(res.data.roadmap);
      setCareer(res.data.progress?.career);
      const lvl = res.data.progress?.level || 1;
      setCurrentLevel(lvl);
      setActiveLevel(lvl);
      setProgress(res.data.progress);

      setLoadingRoadmap(false);
    } catch (error) {
      console.log(error);
      setLoadingRoadmap(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  return (
    <ProtectedRoute>
      <div className="w-full px-6 md:px-12 lg:px-20 pt-0 pb-8">

        {/* TOP SECTION */}
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-10">

          {/* LEFT */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black leading-tight">
              Master Your Learning Journey
            </h1>

            <p className="mt-3 text-base text-gray-500 max-w-lg leading-relaxed">
              Unlock your career path, complete structured roadmaps, earn XP, and level up your skills with AI-powered precision.
            </p>

            {!roadmap && !loadingRoadmap && (
              <Button
                onClick={() => setOpenPopup(true)}
                className="mt-5 px-6 py-2.5 rounded-md text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Start Learning
              </Button>
            )}

            <div className="flex gap-4 mt-6">
               {/* <Link href="/profile" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-all group uppercase tracking-widest">
                  <User className="w-4 h-4" />
                  View Profile
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
               </Link> */}
               <span className="text-gray-200">|</span>
               <Link href="/portfolio" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-all group uppercase tracking-widest">
                  <Briefcase className="w-4 h-4" />
                  My Portfolio
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
               </Link>
               <span className="text-gray-200">|</span>
               <Link href="/career" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-all group uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  Career Hub
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 w-full">
            <InfoCards progress={progress} />
          </div>
        </div>

        {/* LOADER */}
        {loadingRoadmap && <RoadmapLoader />}

        {/* MAIN CONTENT (50/50) */}
        {roadmap && (
          <div className="flex flex-col lg:flex-row gap-10 mt-10 w-full">

            {/* ROADMAP */}
            <div className="w-full lg:w-1/2">
              <RoadmapAccordion 
                roadmap={roadmap} 
                career={career} 
                progress={progress} 
                activeLevel={activeLevel}
                setActiveLevel={setActiveLevel}
                onUpdate={handleProgressUpdate} 
              />
            </div>

            {/* TODO */}
            <div className="w-full lg:w-1/2 sticky top-6">
              <TodoPlanner roadmap={roadmap} currentLevel={activeLevel} />
            </div>

          </div>
        )}

        {/* POPUP */}
        {openPopup && (
          <CareerPopup
            setOpenPopup={setOpenPopup}
            setLoadingRoadmap={setLoadingRoadmap}
            fetchRoadmap={fetchRoadmap}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Home;