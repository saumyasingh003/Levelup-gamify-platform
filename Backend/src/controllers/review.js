import Review from "../models/review.js";
import Progress from "../models/progress.js";

/**
 * Request a Code Review
 */
export const requestReview = async (req, res) => {
  const { projectLink, topic } = req.body;
  try {
    const newReview = new Review({
      requester: req.user._id,
      projectLink,
      topic,
    });
    await newReview.save();
    res.status(201).json({ success: true, message: "Review request submitted!", review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit review request." });
  }
};

/**
 * Get Pending Reviews (for others to claim)
 */
export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      status: "pending", 
      requester: { $ne: req.user._id } 
    }).populate("requester", "name");
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch pending reviews." });
  }
};

/**
 * Complete a Review
 */
export const completeReview = async (req, res) => {
  const { reviewId, feedback, rating } = req.body;
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.reviewer = req.user._id;
    review.feedback = feedback;
    review.rating = rating;
    review.status = "completed";
    await review.save();

    // Award XP to the Reviewer
    const reviewerProgress = await Progress.findOne({ user: req.user._id });
    if (reviewerProgress) {
        const xpAwarded = 100 * (reviewerProgress.streakMultiplier || 1);
        reviewerProgress.xp += xpAwarded;
        
        // Boost soft skills for providing feedback
        if (reviewerProgress.skills && reviewerProgress.skills.softSkills !== undefined) {
          reviewerProgress.skills.softSkills += 5;
        }
        
        await reviewerProgress.save();
    }

    res.status(200).json({ success: true, message: "Review completed and XP awarded!" });
  } catch (error) {
    console.error("Complete Review Error:", error);
    res.status(500).json({ success: false, message: "Failed to complete review." });
  }
};
