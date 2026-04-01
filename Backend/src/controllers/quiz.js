import Progress from "../models/progress.js";

/**
 * Submit Quiz Results
 */
export const submitQuiz = async (req, res) => {
  const { score, totalQuestions, roadmapNodeId } = req.body;
  try {
    const progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      return res.status(404).json({ success: false, message: "Progress not found" });
    }

    // Cooldown check (once per day per topic)
    const history = progress.quizHistory || [];
    const lastAttempt = history.filter(h => h.topicId === roadmapNodeId).sort((a,b) => new Date(b.takenAt) - new Date(a.takenAt))[0];
    
    if (lastAttempt) {
      const now = new Date();
      const last = new Date(lastAttempt.takenAt);
      const diffHrs = (now - last) / (1000 * 60 * 60);

      if (diffHrs < 24) {
        return res.status(403).json({ 
          success: false, 
          message: `Topic Cooldown active. Try again in ${Math.ceil(24 - diffHrs)} hours.` 
        });
      }
    }

    const percentage = (score / totalQuestions) * 100;
    const xpAward = Math.round((percentage / 100) * 50 * (progress.streakMultiplier || 1));

    // Update Stats
    const totalOld = progress.totalQuizzesCompleted || 0;
    const avgOld = progress.averageQuizScore || 0;
    
    progress.totalQuizzesCompleted = totalOld + 1;
    progress.averageQuizScore = ((avgOld * totalOld) + percentage) / (totalOld + 1);
    
    // Log to History
    progress.quizHistory.push({
       topicId: roadmapNodeId,
       score: score,
       totalQuestions: totalQuestions,
       takenAt: new Date()
    });

    // Auto-complete the topic if not already done
    if (roadmapNodeId && !progress.completedTopics.includes(roadmapNodeId)) {
        progress.completedTopics.push(roadmapNodeId);
    }

    progress.xp += xpAward;

    // Increment 'Soft Skills' or 'Logic' based on quiz completion
    if (progress.skills && progress.skills.softSkills !== undefined) {
      progress.skills.softSkills += 2; 
    }

    await progress.save();

    console.log(`[Quiz] User ${req.user?._id} submitted quiz for ${roadmapNodeId}. Score: ${score}/${totalQuestions}`);
    res.status(200).json({ 
      success: true, 
      xpAwarded: xpAward, 
      newTotalXp: progress.xp,
      averageScore: progress.averageQuizScore.toFixed(2),
      progress: progress
    });

  } catch (error) {
    console.error("Submit Quiz Error:", error);
    res.status(500).json({ success: false, message: "Failed to save quiz results." });
  }
};
