import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    career: {
      type: String,
      enum: ["SD", "AI", "DEV", "CP"],
    },

    year: Number,

    level: {
      type: Number,
      default: 0,
    },

    xp: {
      type: Number,
      default: 0,
    },

    completedTopics: [String],

    streak: {
      type: Number,
      default: 0,
    },

    lastVisit: Date,

    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],

    // Ultra Pro Features
    skills: {
      frontend: { type: Number, default: 0 },
      backend: { type: Number, default: 0 },
      softSkills: { type: Number, default: 0 },
      dsa: { type: Number, default: 0 },
      devops: { type: Number, default: 0 },
      ai: { type: Number, default: 0 },
    },

    streakMultiplier: {
      type: Number,
      default: 1,
    },

    totalQuizzesCompleted: {
      type: Number,
      default: 0,
    },

    averageQuizScore: {
      type: Number,
      default: 0,
    },
    quizHistory: [
      {
        topicId: String,
        score: Number,
        totalQuestions: Number,
        takenAt: { type: Date, default: Date.now }
      }
    ],
    weeklyActivity: {
      Mon: { type: Number, default: 0 },
      Tue: { type: Number, default: 0 },
      Wed: { type: Number, default: 0 },
      Thu: { type: Number, default: 0 },
      Fri: { type: Number, default: 0 },
      Sat: { type: Number, default: 0 },
      Sun: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, career: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);