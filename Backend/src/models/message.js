import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      default: "global",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Optimize queries for finding recent messages by channel
messageSchema.index({ channelId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
