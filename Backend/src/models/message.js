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
      required: false,
      maxlength: 1000,
    },
    fileUrl: {
      type: String,
      required: false,
    },
    fileType: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Optimize queries for finding recent messages by channel
messageSchema.index({ channelId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
