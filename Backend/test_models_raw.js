import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
       const list = data.models.map(m => m.name).join("\n");
       fs.writeFileSync("model_list.txt", list);
       console.log("Wrote model list to model_list.txt");
    }
  } catch (e) {
    console.error("FAILED:", e.message);
  }
}

listModels();
