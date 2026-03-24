"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const CareerPopup = ({
  setOpenPopup,
  setLoadingRoadmap,
  fetchRoadmap
}) => {

  const careers = [
    { label: "Software Development", value: "SD" },
    { label: "AI & ML", value: "AI" },
    { label: "DevOps", value: "DEV" },
    { label: "Competitive Programming", value: "CP" },
  ];

  const [selectedCareer, setSelectedCareer] = useState(null);

  // auto close after 2 minutes
  useEffect(() => {

    const timer = setTimeout(() => {
      setOpenPopup(false);
    }, 120000);

    return () => clearTimeout(timer);

  }, [setOpenPopup]);

  const handleConfirm = async () => {

    if (!selectedCareer) return;

    try {

      await api.post("/progress/career", { career: selectedCareer });

      toast.success("Career path selected!");

      setOpenPopup(false);
      setLoadingRoadmap(true);

      // simulate AI roadmap generation delay
      setTimeout(async () => {

        await fetchRoadmap();

        setLoadingRoadmap(false);

      }, 3000);

    } catch (error) {

      toast.error("Error selecting career");

    }

  };

  return (

    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-300">

        {/* Close Button */}
        <button
          onClick={() => setOpenPopup(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors"
        >
          <X size={24} />
        </button>

        {/* Heading */}
        <div className="text-center mb-8">

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Start Your Journey
          </h2>

          <p className="text-gray-500 text-sm">
            Select a career path to generate your personalized roadmap.
            <br />
            <span className="text-red-500 font-medium mt-2 inline-block">
              ⚠ This choice is permanent.
            </span>
          </p>

        </div>

        {/* Career Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {careers.map((career) => (

            <div
              key={career.value}
              onClick={() => setSelectedCareer(career.value)}
              className={`border-2 rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group
              ${
                selectedCareer === career.value
                  ? "bg-black text-white border-black scale-105"
                  : "border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >

              <h3
                className={`font-bold ${
                  selectedCareer === career.value
                    ? "text-white"
                    : "text-gray-800"
                }`}
              >
                {career.label}
              </h3>

              <p
                className={`text-xs mt-1 ${
                  selectedCareer === career.value
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {career.value} Path
              </p>

            </div>

          ))}

        </div>

        {/* Confirm Button */}
        <div className="flex justify-center mt-10">

          <button
            disabled={!selectedCareer}
            onClick={handleConfirm}
            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          >
            Confirm & Initialize Roadmap
          </button>

        </div>

      </div>

    </div>

  );

};

export default CareerPopup;
