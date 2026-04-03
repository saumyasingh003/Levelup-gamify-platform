"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

const TodoPlanner = ({ roadmap, currentLevel, progress }) => {
  const [step, setStep] = useState("ask");
  const [planType, setPlanType] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState({});
  const [openDay, setOpenDay] = useState(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // On mount, check if a saved weekly plan exists
  useEffect(() => {
    const loadSavedPlan = async () => {
      setLoadingSaved(true);
      try {
        const weeklyRes = await api.get("/todo/plan/weekly");
        if (weeklyRes.data?.plan) {
          setPlan(weeklyRes.data.plan);
          setPlanType("weekly");
          setStep("show");
          setLoadingSaved(false);
          return;
        }
      } catch (err) {
        // Plan not found, that's fine
      }

      try {
        const dailyRes = await api.get("/todo/plan/daily");
        if (dailyRes.data?.plan) {
          setPlan(dailyRes.data.plan);
          setPlanType("daily");
          setStep("show");
          setLoadingSaved(false);
          return;
        }
      } catch (err) {
        // Plan not found, that's fine
      }
      setLoadingSaved(false);
    };

    loadSavedPlan();
  }, []);

  const toggleCheck = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async (type) => {
    setPlanType(type);
    setStep("show");
    setLoading(true);
    setPlan(null);
    setChecked({});
    setShowAdvice(false);

    const levelData = roadmap?.find((lvl) => lvl.level === currentLevel);
    if (!levelData) {
      setLoading(false);
      toast("Please open a level in the roadmap first!");
      setStep("ask");
      return;
    }

    // Filter out topics already completed in this level
    const uncompletedTopics = levelData.topics.filter(
      (_, i) => !progress?.completedTopics?.includes(`${currentLevel}-${i}`)
    );

    if (uncompletedTopics.length === 0) {
      setLoading(false);
      toast.success("Level completed! Generate a plan for the next level.");
      setStep("ask");
      return;
    }

    const filteredRoadmap = [{ ...levelData, topics: uncompletedTopics }];

    try {
      const res = await api.post("/todo/generate", {
        planType: type,
        roadmap: filteredRoadmap,
      });
      setPlan(res.data.plan);
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!planType) return;

    // Delete the saved plan first
    try {
      await api.delete(`/todo/plan/${planType}`);
    } catch (err) {
      // Ignore delete errors
    }

    // Regenerate
    handleGenerate(planType);
  };

  const handleBack = () => {
    setStep("choose");
  };

  // TASK CARD
  const TaskCard = ({ task, index, prefix }) => {
    const key = `${prefix}-${index}`;
    const isDone = checked[key];

    return (
      <div className="group flex gap-3 py-2 border-b border-gray-100 last:border-0">
        <button 
          onClick={() => toggleCheck(key)}
          className="mt-0.5 shrink-0"
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-black" />
          ) : (
            <Circle className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
          )}
        </button>

        <div className="flex-1">
          <p className={`text-sm transition-colors ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
            {task.task}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 
              {task.duration}
            </span>
          </div>
          {task.tip && !isDone && (
            <div className="mt-2 text-[11px] text-gray-500 flex gap-1.5 items-start">
              <span>↳</span>
              <span>{task.tip}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (step === "hide") return null;

  // Show a subtle loading state while checking for saved plans
  if (loadingSaved) {
    return (
      <div className="w-full">
        <div className="bg-black rounded-lg p-6 flex justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <Loader2 className="animate-spin w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* STEP 1 */}
   {step === "ask" && (
  <div className="relative group bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 flex items-center justify-between shadow-2xl shadow-black/10 overflow-hidden transition-all hover:shadow-black/20">

    {/* Gradient Glow */}
    <div className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-green-100 via-white to-transparent rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-all duration-500" />

    {/* Subtle grid texture */}
    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

    {/* Content */}
    <div className="relative z-10 flex-1 pr-6">
      
    

      {/* Heading */}
      <h2 className="text-3xl font-black text-black tracking-tight leading-tight mb-3">
        To Do List
      </h2>

      {/* Description */}
      <p className="text-sm text-gray-500 font-medium max-w-md leading-relaxed">
        Generate a smart, structured learning plan tailored to your roadmap and goals — faster and more efficiently.
      </p>

      {/* Buttons */}
  <div className="flex gap-3 mt-6">
  <button
    onClick={() => setStep("choose")}
    className="relative px-4 py-2 rounded-sm text-xs font-black uppercase tracking-wider text-white bg-black overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-black/20"
  >
    <span className="relative z-10">Generate</span>
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent opacity-0 hover:opacity-100 transition-all" />
  </button>

  <button
    onClick={() => setStep("hide")}
    className="px-4 py-2 rounded-sm text-xs font-bold bg-gray-100 text-black hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all"
  >
    Dismiss
  </button>
</div>
    </div>

    {/* Right Image */}
    <div className="relative w-28 h-28 hidden sm:block transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
      <Image
        src="/planner.png"
        alt="Study Planner"
        fill
        className="object-contain drop-shadow-xl"
        priority
      />
    </div>
  </div>
)}

      {/* STEP 2 */}
      {step === "choose" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <button 
            onClick={() => setStep("ask")} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-xs font-bold  tracking-widest hover:bg-gray-800 transition-colors"
          >
            ← Back
          </button>
          
          <h3 className="text-lg font-semibold mt-5 text-black mb-4">Select plan type</h3>

          <div className="flex gap-3">
            {["daily", "weekly"].map((type) => (
              <button
                key={type}
                onClick={() => handleGenerate(type)}
                className="flex-1 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-600 capitalize hover:border-black hover:text-black transition-colors"
              >
                {type} Plan
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === "show" && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">

          {/* HEADER */}
          <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-3">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Generated Plan</p>
              <h2 className="text-2xl font-bold tracking-tight capitalize text-black">{planType} Plan</h2>
            </div>

            {!loading && (
              <div className="flex items-center gap-3">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-xs font-bold  tracking-widest hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                {/* Regenerate Button */}
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-xs font-bold  tracking-widest hover:bg-gray-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Renew
                </button>
              </div>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          )}

          {/* DAILY */}
          {!loading &&
            plan?.planType === "daily" && (
              <div className="flex flex-col">
                {plan.tasks?.map((task, i) => (
                  <TaskCard key={i} task={task} index={i} prefix="d" />
                ))}
              </div>
            )}

          {/* WEEKLY ACCORDION */}
          {!loading && plan?.planType === "weekly" && (
            <div className="flex flex-col">

              {plan.days?.map((day, i) => (
                <div key={i} className={`border-b border-gray-100 last:border-0 transition-all duration-300 ${openDay === i ? "border-l-4 border-l-black pl-3" : "pl-0"}`}>

                  {/* HEADER */}
                  <button
                    onClick={() => setOpenDay(openDay === i ? null : i)}
                    className="w-full flex justify-between items-center py-3 text-left transition-colors group"
                  >
                    <span className={`text-sm font-bold ${openDay === i ? "text-black" : "text-gray-700 group-hover:text-black"}`}>{day.day}</span>

                    {openDay === i ? (
                      <ChevronUp className="w-4 h-4 text-black" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black" />
                    )}
                  </button>

                  {/* CONTENT */}
                  {openDay === i && (
                    <div className="pb-4 pt-1">
                      {day.tasks?.map((task, j) => (
                        <TaskCard
                          key={j}
                          task={task}
                          index={j}
                          prefix={`${i}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* AI INSIGHTS CARD */}
              {plan.advice && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  
                  <button
                    onClick={() => setShowAdvice(!showAdvice)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-black hover:text-white transition-all group/insight shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white rounded-md group-hover/insight:bg-white/10 transition-colors">
                        <Sparkles className="w-3.5 h-3.5 text-black group-hover/insight:text-white" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">AI Strategic Insights</span>
                    </div>
                    {showAdvice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvice && (
                    <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-3 duration-400">
                      
                      {/* GENERAL TIPS */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-3">
                           <div className="w-1 h-4 bg-black rounded-full" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Mastery Tips</h4>
                        </div>
                        <div className="space-y-2.5">
                          {plan.advice.general_tips?.map((tip, i) => (
                            <div key={i} className="flex gap-3 items-start group">
                              <span className="text-base leading-none mt-0.5 transition-transform group-hover:scale-110">💡</span>
                              <p className="text-xs text-gray-600 font-medium leading-relaxed">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CURATED RESOURCES */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                           <ExternalLink className="w-12 h-12 text-black" />
                        </div>

                        <div className="flex items-center gap-1.5 mb-3">
                           <div className="w-1 h-4 bg-[#ceab0d] rounded-full" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Curated Stack</h4>
                        </div>
                        
                        <div className="grid gap-2">
                          {plan.advice.resources?.map((res, i) => (
                            <a
                              key={i}
                              href={res.url}
                              target="_blank"
                              className="group/link flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all bg-white"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 group-hover/link:text-black truncate transition-colors">{res.name}</p>
                              </div>
                              <div className="p-1 bg-gray-50 rounded-md group-hover/link:bg-black transition-all">
                                <ExternalLink className="w-3 h-3 text-gray-400 group-hover/link:text-white" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoPlanner;