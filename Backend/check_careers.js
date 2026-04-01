import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Roadmap from "./src/models/roadmap.js";
import Progress from "./src/models/progress.js";

async function checkDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🔍 Checking unique careers...");

  const roadmapCareers = await Roadmap.distinct("career");
  console.log("Roadmap careers:", roadmapCareers);

  const progressCareers = await Progress.distinct("career");
  console.log("Progress careers:", progressCareers);

  await mongoose.disconnect();
}

checkDB().catch(console.error);
