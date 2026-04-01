"use client";

import React from "react";
import Link from "next/link";
import { 
  Zap, 
  Target, 
  Award, 
  Bot, 
  Code, 
  TrendingUp, 
  Users, 
  Trophy,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star
} from "lucide-react";

const Landing = () => {
  return (
    <div className="bg-white selection:bg-black selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center pt-24 px-6 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-100 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-[120px] delay-700 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black text-black leading-[0.9] tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Gamify Your Growth <br />
            With <span className="text-[#ceab0d]">LevelUp </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            The Premium platform where learning meets gamification. Master Software Engineering, AI, and DevOps through structured roadmaps and real-world XP.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Link
              href="/home"
              className="group h-16 px-10 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-gray-800 transition-all shadow-2xl shadow-black/20"
            >
              Start Free Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="h-16 px-10 border-2 border-black/10 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all">
              Watch Demo
            </button>
          </div>
          
      
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="py-32 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-black leading-none mb-6">
                MASTER EVERY <br /> SUBSYSTEM.
              </h2>
              <p className="text-gray-500 font-medium">We built the most comprehensive professional environment for rapid engineering growth.</p>
            </div>
            <div className="hidden md:block text-right">
               <p className="text-xs font-black uppercase tracking-widest text-black/20">The Platform Advantage</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Bot className="w-6 h-6" />}
              title="Study Buddy"
              desc="Context-aware AI that understands your current roadmap topic and provides instant guidance."
              color="bg-gray-50 text-black"
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Career Hub"
              desc="AI-driven mock interviews and peer code reviews ensuring you're industry-ready."
              color="bg-gray-50 text-black"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Gamified Growth"
              desc="Earn XP, climb leaderboards, and unlock badges as you conquer complex milestones."
              color="bg-gray-50 text-black"
            />
            <FeatureCard 
              icon={<Award className="w-6 h-6" />}
              title="Portfolio Gen"
              desc="Auto-generate a professional engineer's portfolio as you progress through tasks."
              color="bg-gray-50 text-black"
            />
          </div>
        </div>
      </section>

      {/* STATS BREAK */}
      <section className="py-24 px-6 border-y border-black/5">
         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center md:text-left">
               <h4 className="text-4xl font-black text-black mb-1">24.5k+</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Learners</p>
            </div>
            <div className="text-center md:text-left">
               <h4 className="text-4xl font-black text-black mb-1">890k</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Topics Mastered</p>
            </div>
            <div className="text-center md:text-left">
               <h4 className="text-4xl font-black text-black mb-1">4.9/5</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth Rating</p>
            </div>
            <div className="text-center md:text-left">
               <h4 className="text-4xl font-black text-black mb-1">$0.00</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cost to Start</p>
            </div>
         </div>
      </section>

      {/* ROADMAP PREVIEW */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
               <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
               </div>
               <h2 className="text-5xl font-black text-black leading-none">
                  LEVEL 1 TO <br /> SENIOR PRO.
               </h2>
               <p className="text-lg text-gray-500 font-medium leading-relaxed">
                  Our structured paths cover everything from DSA fundamentals to System Design for massive scale. Don't just learn—evolve.
               </p>
               <ul className="space-y-4">
                  {['Software Development', 'AI & Machine Learning', 'DevOps & SRE', 'Competitive Programming'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-black text-black uppercase tracking-tight">
                       <CheckCircle className="w-5 h-5 text-emerald-500" />
                       {item}
                    </li>
                  ))}
               </ul>
            </div>
            <div className="flex-1 w-full bg-gray-50 rounded-3xl p-10 border border-black/5 shadow-2xl skew-y-3 hover:skew-y-0 hover:scale-105 transition-all duration-700 animate-in fade-in slide-in-from-right-12 group">
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 mb-6 transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black text-white bg-black px-2 py-1 rounded">LEVEL 4 EXAM</span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase">IN PROGRESS</span>
                  </div>
                  <h4 className="text-xl font-black text-black">Scalable Node.js Architecture</h4>
                  <div className="mt-6 flex gap-2">
                     <div className="h-2 flex-1 bg-black rounded-full" />
                     <div className="h-2 flex-1 bg-black rounded-full" />
                     <div className="h-2 flex-1 bg-black/10 rounded-full" />
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                     <Zap className="w-6 h-6 text-orange-500 mb-2" />
                     <p className="text-2xl font-black text-black">2,450</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase">XP Collected</p>
                  </div>
                  <div className="flex-1 bg-black p-6 rounded-2xl shadow-sm text-white">
                     <Trophy className="w-6 h-6 text-white mb-2" />
                     <p className="text-2xl font-black">12</p>
                     <p className="text-[10px] font-bold text-white/50 uppercase">Badges Earned</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA (Call To Action) */}
      <section className="py-40 px-6 bg-black flex flex-col items-center justify-center text-center overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="w-[800px] h-[800px] bg-white rounded-full blur-[200px] -ml-96 -mt-96" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
            Ready To Join The <br />
            <span className="text-[#ceab0d]">ENGINEERING ELITE?</span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
            No credit card, no complex onboarding. Just select your path and start growing into the engineer you want to become.
          </p>

          <Link
            href="/home"
            className="inline-flex h-16 px-12 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs items-center gap-3 hover:scale-105 transition-all"
          >
            Start Your Evolution →
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="group relative bg-white p-6 rounded-[32px] border-2 border-black shadow-sm hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full overflow-hidden">
    <div className={`w-16 h-16 ${color} group-hover:bg-black group-hover:text-white rounded-[22px] flex items-center justify-center mb-10 font-bold group-hover:scale-110 transition-all duration-500 shadow-sm border border-black/5`}>
      {icon}
    </div>
    
    <h3 className="text-2xl font-black text-black mb-4 tracking-tight">{title}</h3>
    
    <p className="text-[15px] font-medium text-gray-600 leading-relaxed mb-10 flex-1">
      {desc}
    </p>
    
  </div>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

export default Landing;
