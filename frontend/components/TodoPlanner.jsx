"use client";

import { useState } from "react";
import axios from "axios";
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

const TodoPlanner = ({ roadmap, currentLevel }) => {
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

    const activeLevelData = roadmap?.filter(
      (lvl) => lvl.level === currentLevel
    );

    try {
      const res = await axios.post(
        "https://levelup-gamify-backend.vercel.app/todo/generate",
        { planType: type, roadmap: activeLevelData },
        { withCredentials: true }
      );
      setPlan(res.data.plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // TASK CARD
  const TaskCard = ({ task, index, prefix }) => {
    const key = `${prefix}-${index}`;
    const isDone = checked[key];

    return (
      <div className="flex gap-3 p-3 border rounded-md">
        <button onClick={() => toggleCheck(key)}>
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-black" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-black" />
          )}
        </button>

        <div>
          <p className={`${isDone ? "line-through text-gray-400" : ""}`}>
            {task.task}
          </p>
          <span className="text-xs text-gray-500 flex gap-1 mt-1">
            <Clock className="w-3 h-3" /> {task.duration}
          </span>
        </div>
      </div>
    );
  };

  if (step === "hide") return null;

  return (
    <div className="w-full">

      {/* STEP 1 */}
      {step === "ask" && (
        <div className="mt-11  bg-white border rounded-2xl p-6 flex justify-between">
          <div className="border-l-4 border-black pl-4">
            <h2 className="text-lg font-semibold mt-8 ">Plan Your Learning</h2>
            <p className="text-sm text-gray-500">
            Generate your structured learning plan
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep("choose")}
                className="bg-black text-white px-4 py-2 rounded-md"
              >
                Generate
              </button>

              <button
                onClick={() => setStep("hide")}
                className="border px-4 py-2 rounded-md"
              >
                Later
              </button>
            </div>
          </div>

          <img src="/planner.png" className="w-48 mr-10" />
        </div>
      )}

      {/* STEP 2 */}
      {step === "choose" && (
        <div className="mt-11 bg-white border rounded-2xl p-5">
          <button onClick={() => setStep("ask")} className="text-xs mb-4 flex gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex gap-2">
            {["daily", "weekly"].map((type) => (
              <button
                key={type}
                onClick={() => handleGenerate(type)}
                className="flex-1 py-2 bg-gray-100 rounded-md hover:bg-black hover:text-white"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === "show" && (
        <div className="mt-11 mb-8  bg-white border rounded-2xl p-5">

          {/* HEADER */}
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold capitalize">{planType} Plan</h2>

            {!loading && (
              <button
                onClick={() => setStep("choose")}
                className="bg-gray-700 text-white px-3 py-1 rounded-md text-xs"
              >
                Change
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
            plan?.planType === "daily" &&
            plan.tasks?.map((task, i) => (
              <TaskCard key={i} task={task} index={i} prefix="d" />
            ))}

          {/* WEEKLY ACCORDION */}
          {!loading && plan?.planType === "weekly" && (
            <div className="space-y-3">

              {plan.days?.map((day, i) => (
                <div key={i} className="border rounded-lg">

                  {/* HEADER */}
                  <button
                    onClick={() =>
                      setOpenDay(openDay === i ? null : i)
                    }
                    className="w-full flex justify-between items-center px-4 py-3 text-left"
                  >
                    <span className="font-medium">{day.day}</span>

                    {openDay === i ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* CONTENT */}
                  {openDay === i && (
                    <div className="px-4 pb-3 space-y-2">
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
                <div className="mt-6">

                  <button
                    onClick={() => setShowAdvice(!showAdvice)}
                    className="w-full bg-black text-white py-2 rounded-md text-sm"
                  >
                    {showAdvice ? "Hide Tips" : "Show Tips & Resources"}
                  </button>

                  {showAdvice && (
                    <div className="mt-4 border rounded-lg p-4 bg-gray-50">

                      {/* TIPS */}
                      {plan.advice.general_tips?.map((tip, i) => (
                        <p key={i} className="text-sm mb-2">
                          • {tip}
                        </p>
                      ))}

                      {/* RESOURCES */}
                      <div className="mt-4 space-y-2">
                        {plan.advice.resources?.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            className="flex justify-between border p-2 rounded-md text-sm hover:bg-white"
                          >
                            <span>{res.name}</span>
                            <ExternalLink className="w-4 h-4" />
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