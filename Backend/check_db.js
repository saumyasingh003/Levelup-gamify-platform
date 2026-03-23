import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./src/models/user.js";
import Progress from "./src/models/progress.js";

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find();
  console.log("Users:", JSON.stringify(users.map(u => ({ id: u._id, email: u.email })), null, 2));
  
  const progressList = await Progress.find();
  console.log("Progress:", JSON.stringify(progressList.map(p => ({ user: p.user, career: p.career, topicsCount: p.completedTopics.length })), null, 2));
  
  await mongoose.disconnect();
}

check().catch(console.error);
