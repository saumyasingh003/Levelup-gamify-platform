import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  xpRequired: Number,
  description: String,
  icon: String, // SVG name or Lucide icon name
  type: { 
    type: String, 
    enum: ["milestone", "achievement", "career", "special"], 
    default: "milestone" 
  }
});

export default mongoose.model("Badge", badgeSchema);