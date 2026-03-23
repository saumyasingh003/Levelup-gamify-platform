import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Roadmap from "./src/models/roadmap.js";

async function fixRoadmaps() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🧹 Fixing roadmaps...");
  
  const careerMap = {
    "Software Development": "SD",
    "AI & ML": "AI",
    "DevOps": "DEV",
    "Competitive Programming": "CP"
  };

  for (const [bad, good] of Object.entries(careerMap)) {
    const res = await Roadmap.updateMany({ career: bad }, { $set: { career: good } });
    console.log(`- Updated ${res.modifiedCount} Roadmaps from "${bad}" to "${good}"`);
  }

  await mongoose.disconnect();
}

fixRoadmaps().catch(console.error);
