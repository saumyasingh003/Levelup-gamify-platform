import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Message from "./src/models/message.js";
import User from "./src/models/user.js";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const user = await User.findOne();
  if (!user) {
    console.log("No user found to seed messages for.");
    process.exit(0);
  }

  const messages = [
    {
      channelId: "sd",
      user: user._id,
      text: "Hello everyone! This is a persistent message. 🔥"
    },
    {
      channelId: "sd",
      user: user._id,
      text: "I can now share images and PDFs too! 🚀"
    }
  ];

  await Message.insertMany(messages);
  console.log("Messages seeded successfully!");
  
  await mongoose.disconnect();
}

seed().catch(console.error);
