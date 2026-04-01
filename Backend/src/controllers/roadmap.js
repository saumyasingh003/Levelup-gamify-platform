import Roadmap from "../models/roadmap.js";
import Progress from "../models/progress.js";
import roadmapLevels from "../utils/roadmapLevels.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { updateStreak } from "../utils/updateStreak.js";

export const getUserRoadmap = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing from environment variables!");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const progress = await Progress.findOne({
      user: req.user._id,
    });
    console.log(`[Roadmap] Fetching roadmap for user ${req.user?._id}, career: ${progress?.career}`);

    if (!progress) {
      return res.status(404).json({
        message: "Career not selected",
      });
    }

    await updateStreak(progress);

    const career = progress.career;

    let roadmap = await Roadmap.find({ career }).sort({ level: 1 });

    const careerLabels = {
      SD: "Software Development",
      AI: "AI & ML",
      DEV: "DevOps",
      CP: "Competitive Programming",
    };

    const careerTitle = careerLabels[career] || career;

    if (roadmap.length === 0) {
      const levels = roadmapLevels[career];

      if (!levels) {
        return res.status(400).json({
          message: `Roadmap levels not found for career: ${career}. Valid careers are: ${Object.keys(
            roadmapLevels,
          ).join(", ")}`,
        });
      }
      const levelList = levels
        .map((title, index) => `${index + 1}. ${title}`)
        .join("\n");

      const prompt = `
Generate learning subtopics for the following roadmap in VALID JSON.
Career: ${careerTitle}

Levels and titles to expand:
${levelList}

Requirements:
- Each level must have exactly 5 subtopics in the "topics" array.
- Return ONLY a valid JSON object. No markdown blocks.

Format:
{
  "levels": [
    {
      "level": 1,
      "title": "Level Title",
      "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"]
    }
  ]
}
`;

      const modelNames = ["gemini-2.5-flash", "gemini-3-flash", "gemini-1.5-flash"];
      let result;
      let lastError;

      for (const modelName of modelNames) {
        try {
          console.log(`🤖 Roadmap Generation: Attempting ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          result = await model.generateContent(prompt);
          if (result) break;
        } catch (err) {
          lastError = err;
          console.warn(`⚠️ ${modelName} failed: ${err.message}`);
        }
      }

      if (!result) throw lastError || new Error("All roadmap models failed.");

      let text = result.response.text();

      // Advanced JSON Extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         throw new Error("No valid JSON found in AI response");
      }

      const roadmapJSON = JSON.parse(jsonMatch[0]);

      const savedLevels = [];

      for (const level of roadmapJSON.levels) {
        const levelData = await Roadmap.create({
          career,
          level: level.level,
          title: level.title,
          topics: level.topics,
        });

        savedLevels.push(levelData);
      }

      roadmap = savedLevels;
    }

    console.log(`[Roadmap] Successfully returned ${roadmap.length} levels for ${req.user?._id}`);
    res.json({
      progress,
      roadmap,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
