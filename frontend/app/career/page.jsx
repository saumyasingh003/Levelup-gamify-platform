"use client";

import React from "react";
import { ExternalLink, Monitor } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const CareerHub = () => {
  const handleLaunch = () => {
    window.open("https://automentor-three.vercel.app/meetings", "_blank");
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-[85vh] flex items-start justify-center pt-36 pb-10 px-6 text-white overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/interview.jpg"
            alt="Interview Background"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
        </div>

        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

        {/* Content */}
        <div className="relative z-10 max-w-md w-full text-center space-y-8">

          {/* ICON */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center text-black border border-white/30 shadow-xl">
              <Monitor className="w-8 h-8" />
            </div>
          </div>

          {/* HEADLINE */}
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight">
              Mock Interview Access
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Redirecting to the AutoMentor assessment platform. Click below to start your session.
            </p>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleLaunch}
            className="w-full py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20"
          >
            Launch AutoMentor
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* FOOTER */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
              LevelUp Nexus Node
            </p>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CareerHub;