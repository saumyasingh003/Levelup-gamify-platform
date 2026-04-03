import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are a test helper."
    });
    console.log("Model setup complete, sending message...");
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage([{ text: "I am ready. Please start the interview." }]);
    console.log("SUCCESS:", await result.response.text());
  } catch (error) {
    console.error("FAILURE:", error);
  }
}

test();
