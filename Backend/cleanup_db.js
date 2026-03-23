import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Progress from "./src/models/progress.js";

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🧹 Cleanup started...");
  
  const careerMap = {
    "Software Development": "SD",
    "AI & ML": "AI",
    "DevOps": "DEV",
    "Competitive Programming": "CP"
  };

  // 1. Update invalid career names to short codes
  for (const [bad, good] of Object.entries(careerMap)) {
    const res = await Progress.updateMany({ career: bad }, { $set: { career: good } });
    console.log(`- Updated ${res.modifiedCount} records from "${bad}" to "${good}"`);
  }

  // 2. Delete any remaining records that are still not in enum
  const validCareers = ["SD", "AI", "DEV", "CP"];
  const res2 = await Progress.deleteMany({ career: { $nin: validCareers } });
  console.log(`- Deleted ${res2.deletedCount} remaining invalid career records`);
  
  // 3. Delete duplicate progress records for the same (user, career)
  const duplicateProgress = await Progress.aggregate([
    {
      $group: {
        _id: { user: "$user", career: "$career" },
        count: { $sum: 1 },
        ids: { $push: "$_id" }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ]);
  
  let deletedCount = 0;
  for (const group of duplicateProgress) {
    const [keepId, ...deleteIds] = group.ids;
    const res = await Progress.deleteMany({ _id: { $in: deleteIds } });
    deletedCount += res.deletedCount;
  }
  console.log(`- Deleted ${deletedCount} duplicate progress records`);
  
  await mongoose.disconnect();
  console.log("✅ Cleanup finished!");
}

cleanup().catch(console.error);
