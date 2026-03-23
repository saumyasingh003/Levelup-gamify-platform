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

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const levelList = levels
        .map((title, index) => `${index + 1}. ${title}`)
        .join("\n");

      const prompt = `
Generate learning subtopics for the following roadmap.
Career: ${careerTitle}

Levels and titles to expand:
${levelList}

Requirements:
- Each level must have exactly 5 subtopics in the "topics" array.
- Return ONLY a valid JSON object. No other text or markdown blocks.

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

      const result = await model.generateContent(prompt);

      let text = result.response.text();

      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const roadmapJSON = JSON.parse(text);

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
