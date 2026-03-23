import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  career: {
    type: String,
    enum: [
      "SD",
      "AI",
      "DEV",
      "CP",
    ],
    required: true,
  },

  level: {
    type: Number,
    required: true,
  },

  title: String,

  topics: [String],
});

export default mongoose.model("Roadmap", roadmapSchema);
