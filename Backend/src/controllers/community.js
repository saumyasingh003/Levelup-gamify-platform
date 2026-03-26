import Progress from "../models/progress.js";

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Progress.aggregate([
      // Group by user to combine all career paths
      {
        $group: {
          _id: "$user",
          totalXp: { $sum: "$xp" },
          maxLevel: { $max: "$level" },
          maxStreak: { $max: "$streak" }
        }
      },
      // Sort by total XP descending
      { $sort: { totalXp: -1 } },
      // Limit to Top 50
      { $limit: 50 },
      // Lookup the user details to get the name
      {
        $lookup: {
          from: "users", // User collection name
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      // Project final fields
      {
        $project: {
          _id: 1, 
          name: "$userDetails.name",
          totalXp: 1,
          maxLevel: 1,
          maxStreak: 1
        }
      }
    ]);

    // Map highest level to a generic badge internally and format numbers
    const formattedLeaderboard = leaderboard.map((user, index) => {
      let badge = "Novice";
      if (user.maxLevel >= 15) badge = "Grandmaster";
      else if (user.maxLevel >= 10) badge = "Master";
      else if (user.maxLevel >= 7) badge = "Expert";
      else if (user.maxLevel >= 4) badge = "Advanced";
      else if (user.maxLevel >= 2) badge = "Adept";
      else if (user.maxLevel >= 1) badge = "Beginner";
      
      const formattedXp = user.totalXp >= 1000 
        ? (user.totalXp / 1000).toFixed(1) + "k" 
        : user.totalXp || 0;

      return {
        id: user._id,
        rank: index + 1,
        name: user.name || "Unknown User",
        level: user.maxLevel || 1,
        xp: formattedXp,
        badge: badge,
        streak: user.maxStreak || 0
      };
    });

    res.status(200).json({ success: true, data: formattedLeaderboard });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard." });
  }
};
