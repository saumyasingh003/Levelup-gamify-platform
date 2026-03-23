import Progress from "../models/progress.js";
import User from "../models/user.js";
import Roadmap from "../models/roadmap.js";
import Badge from "../models/badge.js";
import { updateStreak } from "../utils/updateStreak.js";

// CREATE PROGRESS
export const selectCareer = async (req, res) => {
  try {
    const { career: rawCareer } = req.body;
    const user = await User.findById(req.user._id);

    // Map long career names to short codes if they exist
    const careerMap = {
      "Software Development": "SD",
      "AI & ML": "AI",
      "DevOps": "DEV",
      "Competitive Programming": "CP"
    };

    const career = careerMap[rawCareer] || rawCareer;

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, career },
      {
        $setOnInsert: {
          user: req.user._id,
          career,
          year: user.year,
          level: 1,
          streak: 1,
          lastVisit: new Date(),
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json(progress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// GET PROGRESS
export const getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id }).populate("badges");

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    progress = await updateStreak(progress);

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 MAIN LOGIC (UPDATED)
export const toggleTopic = async (req, res) => {
  try {
    console.log("Toggle payload:", req.body);
    const level = Number(req.body.level);
    const topicIndex = Number(req.body.topicIndex);

    const progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    const topicKey = `${level}-${topicIndex}`;
    const index = progress.completedTopics.indexOf(topicKey);

    let leveledUp = false;
    let newBadge = null;
    let isFinal = false;

    if (index === -1) {
      // ADD TOPIC
      progress.completedTopics.push(topicKey);
      progress.xp += 10;

      const levelRoadmap = await Roadmap.findOne({
        career: progress.career,
        level,
      });

      if (levelRoadmap) {
        const completedCount = progress.completedTopics.filter((t) =>
          t.startsWith(`${level}-`)
        ).length;

        if (
          completedCount === levelRoadmap.topics.length &&
          progress.level <= level
        ) {
          isFinal = level === 7;
          if (!isFinal) {
             progress.level = level + 1;
          }
          progress.xp += 100;
          leveledUp = true;

          const badgeName = isFinal ? "Roadmap Master" : `Level ${level} Completer`;

          let badge = await Badge.findOne({ name: badgeName });

          if (!badge) {
            badge = await Badge.create({
              name: badgeName,
              description: isFinal ? "Mastered the entire roadmap!" : `Completed Level ${level}`,
            });
          }

          if (!progress.badges.includes(badge._id)) {
            progress.badges.push(badge._id);
            newBadge = badge;
          }
        }
      }
    } else {
      // REMOVE TOPIC
      progress.completedTopics.splice(index, 1);
      progress.xp = Math.max(0, progress.xp - 10);
    }

    progress.markModified("completedTopics");
    await progress.save();

    res.json({
      progress,
      leveledUp,
      newBadge,
      isFinal,
    });
  } catch (error) {
    console.log("Error in toggleTopic:", error);
    res.status(500).json({ message: error.message });
  }
};