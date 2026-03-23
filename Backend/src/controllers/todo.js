import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateTodoPlan = async (req, res) => {
  try {
    const { planType, roadmap } = req.body;

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build a summary of all levels and their subtopics (usually just 1 level passed now)
    const roadmapSummary = roadmap
      .map(
        (level) =>
          `Level ${level.level} — ${level.title}:\n  Subtopics: ${level.topics.join(", ")}`
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
You are an expert learning coach and study planner. Your job is to create a highly actionable, structured study plan.

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

Return ONLY valid JSON, no markdown, no extra text.

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

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Clean up any markdown formatting
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const todoPlan = JSON.parse(text);

    res.json({ plan: todoPlan });
  } catch (error) {
    console.error("❌ Todo generation error:", error);
    res.status(500).json({
      message: "Failed to generate todo plan",
      error: error.message,
    });
  }
};
