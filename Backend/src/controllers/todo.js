import { GoogleGenerativeAI } from "@google/generative-ai";
import StudyPlan from "../models/studyPlan.js";

export const generateTodoPlan = async (req, res) => {
  try {
    const { planType, roadmap } = req.body;
    const userId = req.user._id;
    console.log(`[Todo] Generating ${planType} plan for user ${userId}`);

    if (!planType || !roadmap || !Array.isArray(roadmap) || roadmap.length === 0) {
      return res.status(400).json({
        message: "Missing required fields: planType (daily/weekly) and roadmap array",
      });
    }

    if (!["daily", "weekly"].includes(planType)) {
      return res.status(400).json({
        message: "planType must be one of: daily, weekly",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing from environment variables!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Build a summary of all levels and their subtopics (usually just 1 level passed now)
    const roadmapSummary = (roadmap || [])
      .map(
        (level) =>
          `Level ${level.level} — ${level.title}:\n  Subtopics: ${
            Array.isArray(level.topics) 
              ? level.topics.filter(t => typeof t === "string").join(", ") 
              : "No topics provided"
          }`
      )
      .join("\n\n");

    const planInstructions = {
      daily: `Generate a focused DAILY study plan for today.
- Pick the most impactful 1-3 tasks from the subtopics below for a daily session.
- Each task should be completable in 30–60 minutes.
- Order them by priority (most important first).`,

      weekly: `Generate a structured WEEKLY study plan (Monday to Sunday).
- Distribute tasks across all 7 days effectively.
- Each day should have 1-3 focused tasks from the subtopics.
- Include a rest/review day on Sunday with lighter tasks.`,
    };

    const prompt = `
You are an expert learning coach and study planner. Your job is to create a highly actionable, structured study plan in VALID JSON.

${planInstructions[planType]}

The user is focusing on the following current level of their learning roadmap:
${roadmapSummary}

IMPORTANT REQUIREMENTS:
1. Base the tasks on the specific subtopics provided in the roadmap summary above.
2. Each task must be specific and actionable (not vague like "study X").
3. For each task, include:
   - "task": A clear, specific task description
   - "duration": Estimated time to complete (e.g. "45 min", "1 hour")
   - "tip": A short, practical tip on how to do this more efficiently or faster
4. At the end, include a "advice" section with:
   - "general_tips": An array of 3–4 general productivity/learning tips
   - "resources": An array of 3–5 recommended resources with "name", "url", and "type" (video/article/course/tool)

Return ONLY valid JSON. No markdown backticks.

${planType === "daily" ? `
Format:
{
  "planType": "daily",
  "tasks": [
    {
      "task": "...",
      "duration": "...",
      "tip": "..."
    }
  ],
  "advice": {
    "general_tips": ["...", "..."],
    "resources": [
      { "name": "...", "url": "...", "type": "video" }
    ]
  }
}` : ""}

${planType === "weekly" ? `
Format:
{
  "planType": "weekly",
  "days": [
    {
      "day": "Monday",
      "tasks": [
        {
          "task": "...",
          "duration": "...",
          "tip": "..."
        }
      ]
    }
  ],
  "advice": {
    "general_tips": ["...", "..."],
    "resources": [
      { "name": "...", "url": "...", "type": "article" }
    ]
  }
}` : ""}
`;

    const modelNames = ["gemini-2.5-flash", "gemini-3-flash", "gemini-1.5-flash"];
    let result;
    let lastError;

    for (const modelName of modelNames) {
      try {
        console.log(`🤖 Attempting generation with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        if (result) break;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ ${modelName} failed: ${err.message}`);
      }
    }

    if (!result) throw lastError || new Error("All Gemini models failed to generate content.");
    
    let text = result.response.text();

    // Advanced JSON Extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
       throw new Error("No valid JSON found in AI response");
    }
    
    const todoPlan = JSON.parse(jsonMatch[0]);

    // Save/upsert the plan into the database
    const currentLevel = roadmap[0]?.level || null;
    await StudyPlan.findOneAndUpdate(
      { userId, planType },
      { plan: todoPlan, roadmapLevel: currentLevel },
      { upsert: true, new: true }
    );

    console.log(`[Todo] Successfully generated and saved ${planType} plan for ${userId}`);
    res.json({ plan: todoPlan });
  } catch (error) {
    console.error("❌ Todo generation error:", error);
    res.status(500).json({
      message: "Failed to generate todo plan",
      error: error.message,
      stack: error.stack // Debugging
    });
  }
};

// GET saved plan for a user
export const getSavedPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planType } = req.params;

    if (!["daily", "weekly"].includes(planType)) {
      return res.status(400).json({ message: "planType must be daily or weekly" });
    }

    const saved = await StudyPlan.findOne({ userId, planType });

    if (!saved) {
      return res.json({ plan: null });
    }

    res.json({ plan: saved.plan, savedAt: saved.updatedAt });
  } catch (error) {
    console.error("❌ Get saved plan error:", error);
    res.status(500).json({ message: "Failed to get saved plan", error: error.message });
  }
};

// DELETE a saved plan (used when user clicks "Regenerate")
export const deleteSavedPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planType } = req.params;

    if (!["daily", "weekly"].includes(planType)) {
      return res.status(400).json({ message: "planType must be daily or weekly" });
    }

    await StudyPlan.findOneAndDelete({ userId, planType });

    res.json({ success: true, message: "Plan deleted" });
  } catch (error) {
    console.error("❌ Delete plan error:", error);
    res.status(500).json({ message: "Failed to delete plan", error: error.message });
  }
};
