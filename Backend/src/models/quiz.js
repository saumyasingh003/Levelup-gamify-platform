import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      index: true,
    },
    career: {
      type: String,
      required: true,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
        explanation: String,
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    xpAward: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
