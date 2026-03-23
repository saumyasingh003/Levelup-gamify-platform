"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import InfoCards from "@/components/InfoCards";
import CareerPopup from "@/components/CareerPopup";
import RoadmapLoader from "@/components/RoadmapLoader";
import RoadmapAccordion from "@/components/RoadmapAccordion";
import TodoPlanner from "@/components/TodoPlanner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [career, setCareer] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [progress, setProgress] = useState(null);

  const handleProgressUpdate = (updatedProgress) => {
    if (!updatedProgress) return;
    setCareer(updatedProgress.career);
    setCurrentLevel(updatedProgress.level ?? 1);
    setProgress(updatedProgress);
  };

  const fetchRoadmap = async () => {
    try {
      setLoadingRoadmap(true);

      const res = await axios.get("http://localhost:5000/roadmap", {
        withCredentials: true,
      });

      setRoadmap(res.data.roadmap);
      setCareer(res.data.progress?.career);
      setCurrentLevel(res.data.progress?.level || 1);
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
      <div className="w-full px-6 md:px-12 pt-8">

        {/* TOP SECTION */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-black">
              Your Learning Journey Starts Here
            </h1>

            <p className="mt-4 text-gray-600">
              Master your career path, earn XP, and level up your skills.
            </p>

            {!roadmap && !loadingRoadmap && (
              <Button
                onClick={() => setOpenPopup(true)}
                className="mt-6 px-6 py-3"
              >
                Start Learning
              </Button>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex-1">
            <InfoCards progress={progress} />
          </div>
        </div>

        {/* LOADER */}
        {loadingRoadmap && <RoadmapLoader />}

        {/* MAIN CONTENT (50/50) */}
        {roadmap && (
          <div className="flex flex-col lg:flex-row gap-10 mt-14 w-full">

            {/* ROADMAP */}
            <div className="w-full lg:w-1/2">
              <RoadmapAccordion 
                roadmap={roadmap} 
                career={career} 
                progress={progress} 
                onUpdate={handleProgressUpdate} 
              />
            </div>

            {/* TODO */}
            <div className="w-full lg:w-1/2 sticky top-6">
              <TodoPlanner roadmap={roadmap} currentLevel={currentLevel} />
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