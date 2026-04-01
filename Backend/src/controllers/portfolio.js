import Progress from "../models/progress.js";
import User from "../models/user.js";
import Roadmap from "../models/roadmap.js";

/**
 * Get Portfolio Data
 */
export const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const progress = await Progress.find({ user: req.user._id }).populate("badges");
    const allRoadmaps = await Roadmap.find({}); // Fetch once for mapping

    // Format data professionally
    const portfolio = {
      user: {
        name: user.name,
        email: user.email,
        github: user.githubLink,
        linkedin: user.linkedinLink,
        year: user.year,
      },
      stats: {
        totalXp: (progress || []).reduce((acc, p) => acc + p.xp, 0),
        totalBadges: (progress || []).reduce((acc, p) => acc + (p.badges?.length || 0), 0),
        highestLevel: progress?.length > 0 ? Math.max(...progress.map(p => p.level)) : 1,
      },
      skills: (progress || []).reduce((acc, p) => {
         Object.keys(p.skills || {}).forEach(key => {
           acc[key] = (acc[key] || 0) + p.skills[key];
         });
         return acc;
      }, {}),
      careerPaths: (progress || []).map(p => {
        const levels = [1, 2, 3, 4, 5, 6, 7].map(lvl => {
          const roadmap = allRoadmaps.find(r => r.career === p.career && r.level === lvl);
          const total = roadmap ? roadmap.topics.length : 0;
          const completedInLevel = p.completedTopics.filter(t => t.startsWith(`${lvl}-`)).length;
          return {
            level: lvl,
            completed: completedInLevel,
            total: total,
            percent: total > 0 ? Math.round((completedInLevel / total) * 100) : 0
          };
        });

        return {
          career: p.career,
          level: p.level,
          topicsCompleted: p.completedTopics.length,
          badges: p.badges.map(b => b.name),
          levels: levels
        };
      }),
      activity: (progress || []).reduce((acc, p) => {
        Object.keys(p.weeklyActivity || {}).forEach(day => {
          acc[day] = (acc[day] || 0) + p.weeklyActivity[day];
        });
        return acc;
      }, { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }),
      quizHistory: (progress || []).reduce((acc, p) => {
        return [...acc, ...(p.quizHistory || [])];
      }, []).sort((a,b) => new Date(a.takenAt) - new Date(b.takenAt))
    };

    // Calculate level-wise quiz scores (Analytical Progress) based on ALL quizzes
    const analyticalProgress = [1, 2, 3, 4, 5, 6, 7].map(lvl => {
      const quizzesAtLevel = portfolio.quizHistory.filter(q => {
        const roadmap = allRoadmaps.find(r => r.topics.includes(q.topicId));
        return roadmap && roadmap.level === lvl;
      });

      const avgScore = quizzesAtLevel.length > 0
        ? quizzesAtLevel.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / quizzesAtLevel.length
        : 0;

      return { name: `Level ${lvl}`, value: Math.round(avgScore * 100) };
    });

    portfolio.analyticalProgress = analyticalProgress;

    console.log(`[Portfolio] Data generated for user ${req.user?._id}`);
    res.status(200).json({ success: true, data: portfolio });
  } catch (error) {
    console.error("Portfolio Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate portfolio data." });
  }
};
