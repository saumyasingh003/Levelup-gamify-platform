import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Roadmap from "./src/models/roadmap.js";

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const roadmaps = await Roadmap.find().limit(5);
  console.log("Roadmaps samples:", JSON.stringify(roadmaps.map(r => ({ career: r.career, level: r.level })), null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
