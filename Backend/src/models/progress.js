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
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, career: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);