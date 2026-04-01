import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    roadmapLevel: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Unique constraint: one plan per user per planType
studyPlanSchema.index({ userId: 1, planType: 1 }, { unique: true });

export default mongoose.model("StudyPlan", studyPlanSchema);
