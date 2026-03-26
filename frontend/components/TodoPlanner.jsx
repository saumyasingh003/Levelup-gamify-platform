"use client";

import { useState } from "react";
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

  // TASK CARD
  const TaskCard = ({ task, index, prefix }) => {
    const key = `${prefix}-${index}`;
    const isDone = checked[key];

    return (
      <div className="group flex gap-3 py-3 border-b border-gray-100 last:border-0">
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

  return (
    <div className="w-full">

      {/* STEP 1 */}
      {step === "ask" && (
        <div className="bg-black rounded-lg p-6 flex justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white tracking-tight">AI Study Dashboard</h2>
            <p className="text-sm text-gray-400 mt-1 max-w-sm">
              Generate a highly-focused learning plan based on your roadmap.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep("choose")}
                className="bg-white text-black px-5 py-2 rounded-md text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                Generate Plan
              </button>

              <button
                onClick={() => setStep("hide")}
                className="px-5 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === "choose" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <button 
            onClick={() => setStep("ask")} 
            className="text-sm font-medium text-gray-500 mb-6 flex items-center hover:text-black transition-colors"
          >
            ← Back
          </button>
          
          <h3 className="text-lg font-semibold text-black mb-4">Select plan type</h3>

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
              <button
                onClick={() => setStep("choose")}
                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
              >
                Reset
              </button>
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
                    className="w-full flex justify-between items-center py-4 text-left transition-colors group"
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

              {/* AI TIPS BELOW WEEKLY */}
              {plan.advice && (
                <div className="mt-8 pt-6 border-t border-gray-100">

                  <button
                    onClick={() => setShowAdvice(!showAdvice)}
                    className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    {showAdvice ? "Hide AI Insights" : "Show AI Insights"}
                  </button>

                  {showAdvice && (
                    <div className="mt-4 pb-2">
                      
                      {/* TIPS */}
                      <div className="space-y-2 mb-6 text-sm text-gray-600">
                        {plan.advice.general_tips?.map((tip, i) => (
                          <div key={i} className="flex gap-2.5">
                            <span className="text-gray-400">-</span>
                            <p>{tip}</p>
                          </div>
                        ))}
                      </div>

                      {/* RESOURCES */}
                      <h4 className="text-xs font-medium text-gray-900 mb-3">Resources</h4>
                      <div className="flex flex-col gap-2">
                        {plan.advice.resources?.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            className="text-sm text-gray-600 hover:text-black underline decoration-gray-200 hover:decoration-black transition-colors inline-flex w-fit"
                          >
                            {res.name}
                          </a>
                        ))}
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