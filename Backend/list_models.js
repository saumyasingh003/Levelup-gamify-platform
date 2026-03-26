import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const result = await genAI.listModels();
    console.log("AVAILABLE MODELS:");
    for (const m of result.models) {
      console.log(`- ${m.name}`);
    }
  } catch (e) {
    console.error("FAILED:", e.message);
  }
}

listModels();
