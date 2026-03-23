import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: String,
  xpRequired: Number,
  description: String
});

export default mongoose.model("Badge", badgeSchema);