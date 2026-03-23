import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error("Error:", error.message);

    if (
      error.message.includes("MongooseServerSelectionError") ||
      error.message.includes("SSL")
    ) {
      console.log(
        "💡 Tip: This is likely an IP Whitelist issue. Go to MongoDB Atlas > Network Access and add your current IP address (or 0.0.0.0/0).",
      );
    }

    process.exit(1);
  }
};

export default connectDB;
