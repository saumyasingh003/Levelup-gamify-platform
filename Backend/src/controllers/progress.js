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

    console.log(`[Progress] Career selected: ${career} for user ${req.user?._id}`);
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
// HEARTBEAT ACTIVITY TRACKING
export const recordActivityHeartbeat = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id });
    if (!progress) return res.status(404).json({ message: "Progress not found" });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = days[new Date().getDay()];

    if (!progress.weeklyActivity) {
      progress.weeklyActivity = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    }
    
    // Heartbeat increments by 0.1h (approx 6 minutes)
    progress.weeklyActivity[currentDay] = (progress.weeklyActivity[currentDay] || 0) + 0.1;

    progress.markModified("weeklyActivity");
    await progress.save();

    res.status(200).json({ success: true, activity: progress.weeklyActivity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      // Sequential unlock gate: subtopic N requires previous subtopic to be ticked + quizzed
      if (topicIndex > 0) {
        const prevTopicKey = `${level}-${topicIndex - 1}`;
        const prevDone = progress.completedTopics.includes(prevTopicKey);

        const levelRoadmapData = await Roadmap.findOne({
          career: progress.career,
          level,
        });

        if (levelRoadmapData) {
          const prevTopicName = levelRoadmapData.topics[topicIndex - 1];
          const prevQuizzed = prevTopicName
            ? (progress.quizHistory || []).some((h) => h.topicId === prevTopicName)
            : false;

          if (!prevDone || !prevQuizzed) {
            return res.status(403).json({
              message: "Complete the previous subtopic & its quiz to unlock this one!",
            });
          }
        }
      }

      // ADD TOPIC
      progress.completedTopics.push(topicKey);
      
      const multiplier = progress.streakMultiplier || 1;
      const baseXP = 10;
      progress.xp += Math.round(baseXP * multiplier);

      // Increment relevant skill
      const careerToSkill = {
        "SD": "frontend", // Simplified: can be logic-based later
        "AI": "ai",
        "DEV": "devops",
        "CP": "dsa"
      };
      const skillKey = careerToSkill[progress.career] || "softSkills";
      if (progress.skills && progress.skills[skillKey] !== undefined) {
        progress.skills[skillKey] += 1;
      }

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
            progress.xp += Math.round(100 * (progress.streakMultiplier || 1));
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

    // Record weekly activity (simulate 0.5h per topic completion)
    if (index === -1) {
       const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
       const currentDay = days[new Date().getDay()];
       if (!progress.weeklyActivity) {
         progress.weeklyActivity = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
       }
       progress.weeklyActivity[currentDay] = (progress.weeklyActivity[currentDay] || 0) + 0.5;
       progress.markModified("weeklyActivity");
    }

    progress.markModified("completedTopics");
    await progress.save();

    console.log(`[Progress] Topic toggled: ${topicKey} by user ${req.user?._id}. Leveled up: ${leveledUp}`);
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