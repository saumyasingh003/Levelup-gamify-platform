import { GoogleGenerativeAI } from "@google/generative-ai";
import Progress from "../models/progress.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Robust AI Caller with Exponential Backoff + Model Fallback
 */
const callAILayer = async (taskFn, customSystemInstruction = null, generationConfig = {}) => {
  const models = [
    "gemini-3.1-pro",
    "gemini-3.1-flash",
    "gemini-3-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
  ];
  let lastError;

  for (const modelName of models) {
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const config = { model: modelName };
        if (customSystemInstruction) config.systemInstruction = customSystemInstruction;
        const modelInstance = genAI.getGenerativeModel(config, { generationConfig });
        return await taskFn(modelInstance);
      } catch (error) {
        lastError = error;
        const errMsg = error.message?.toLowerCase() || "";
        const isRetryable = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate") || errMsg.includes("overloaded");
        
        if (isRetryable && attempt < 1) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        
        if (isRetryable || errMsg.includes("not found") || errMsg.includes("404") || errMsg.includes("permission") || errMsg.includes("api key")) {
          console.warn(`[Reliability] ${modelName} error: ${error.message}. Trying fallback...`);
          break; 
        }
        throw error;
      }
    }
  }
  throw lastError;
};

/**
 * AI Study Buddy: Contextual chat
 */
export const studyBuddyChat = async (req, res) => {
  const { message, context, history } = req.body;
  console.log(`[AI Buddy] Streaming request from user ${req.user?._id} for topic: ${context?.topic}`);
  
  try {
    const prompt = `
      You are an expert AI Study Buddy. 
      Context: ${context.career} path, Level ${context.level}, Topic: ${context.topic}.
      
      STRICT GUIDELINES:
      1. Be extremely concise. No long intros or outros.
      2. Use Markdown for formatting (bold, lists, code blocks).
      3. Focus ONLY on the user's question within the roadmap context.
      4. If irrelevant, give a 1-sentence pivot back to the topic.
      5. Max response length: 150 words unless code is requested.

      User Message: "${message}"
    `;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    await callAILayer(async (model) => {
      let sanitizedHistory = history || [];
      if (sanitizedHistory.length > 0 && sanitizedHistory[0].role === 'model') {
        sanitizedHistory = sanitizedHistory.slice(1);
      }

      const chat = model.startChat({ history: sanitizedHistory });
      const result = await chat.sendMessageStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(chunkText);
      }
      res.end();
    }, null, { maxOutputTokens: 500, temperature: 0.7 });

    console.log(`[AI Buddy] Stream completed for ${req.user?._id}`);
  } catch (error) {
    console.error("AI Study Buddy Stream Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "AI Study Buddy encountered a streaming error." });
    } else {
      res.end();
    }
  }
};

/**
 * Smart Quiz Generator
 */
export const generateQuiz = async (req, res) => {
  const { topic, career, level } = req.body;
  console.log(`[Quiz Gen] Request for topic: ${topic}, level: ${level}`);
  try {
    const prompt = `
      Generate a professional multiple-choice quiz for the topic: "${topic}".
      Target Audience: A ${career} student at learning level ${level}.
      
      Output MUST be a JSON array of 5 objects with this structure:
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctIndex": number (0-3),
        "explanation": "string explaining why the answer is correct"
      }
      
      Return ONLY the JSON. No extra text.
    `;

    const quizData = await callAILayer(async (model) => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text.replace(/```json|```/g, ""));
    });

    console.log(`[Quiz Gen] Successfully generated 5 questions for ${topic}`);
    res.status(200).json({ success: true, data: quizData });
  } catch (error) {
    console.error("Quiz Gen Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate quiz." });
  }
};


// Mock Interview Assistant
export const mockInterview = async (req, res) => {
  const { career, history, resume, audioData, audioMimeType } = req.body;

  try {
    const questionCount = history ? history.filter(h => h.role === 'model').length : 0;
    const safeResume = resume && resume.length > 15000 ? resume.substring(0, 15000) + "..." : resume;

    const systemInstruction = `
You are a professional AI Tech Interviewer for the role: ${career || "Software Engineer"}.

CONTEXT:
Candidate's Resume: ${safeResume || "No resume provided"}

PROTOCOL:
1. Question #1: Request a professional introduction.
2. Question #2-9: Deep dive into the technologies mentioned in the resume or previous answer.
3. Question #10: Final behavioral/career question.
4. Escalation: Increase technical complexity with each turn (Entry -> Mid -> Senior).

GUIDELINES:
- Ask exactly ONE clear question at a time.
- Keep responses compact (50 words max).
- If you have enough info after 10 questions, return the evaluation JSON.
- Never repeat "Introduce yourself" if the history shows it was already done.

CRITICAL - AUDIO TRANSCRIPTION:
If the user's input contains audio, you MUST transcribe exactly what they said. Use this format:
Transcript: [exact words from audio]
Response: [your next interview question]

EVALUATION JSON (ONLY after turn 10):
{
  "overallScore": 0-100,
  "feedback": "summary",
  "strengths": ["list"],
  "improvements": ["list"]
}
`;
    const resultData = await callAILayer(async (model) => {
      // Robust Gemini History Alignment (MUST alternate user/model)
      let chatHistory = [];
      let expectedRole = "user";

      if (history && history.length > 0) {
        const historyMinusLatest = history.slice(0, -1);
        
        // If the first message in our app's history is the AI's opening question,
        // we MUST pad the beginning with a dummy user message for Gemini.
        if (historyMinusLatest.length > 0 && historyMinusLatest[0].role === "model") {
           chatHistory.push({ role: "user", parts: [{ text: "I am ready. Please begin the interview." }] });
           expectedRole = "model";
        }

        for (const msg of historyMinusLatest) {
           if (msg.role === expectedRole) {
              chatHistory.push(msg);
              expectedRole = expectedRole === "user" ? "model" : "user";
           }
        }
      }

      const chat = model.startChat({ 
        history: chatHistory,
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
      });

      const lastUserText = history && history.length > 0 
        ? history[history.length - 1].parts[0].text 
        : "Start interview";

      // Inject stage context into the current prompt to guide progression
      const stageContext = questionCount === 0 
        ? "INSTRUCTION: Begin the interview with a welcoming introduction request."
        : `INSTRUCTION: This is Question #${questionCount + 1}. You MUST ask a technical question directly related to their previous answer or resume. DO NOT ask them to introduce themselves again.`;

      const parts = [{ text: `${stageContext}\n\nCandidate Input: ${lastUserText || "[Silence]"}` }];

      if (audioData) {
        parts.push({
          inlineData: {
            mimeType: audioMimeType || "audio/webm",
            data: audioData
          }
        });
      }

      const result = await chat.sendMessage(parts);
      const rawText = (await result.response).text().trim();

      // Evaluation parsing
      if (questionCount >= 10 || rawText.includes('"overallScore"')) {
        const jsonMatch = rawText.match(/\{[\s\S]*"overallScore"[\s\S]*\}/);
        if (jsonMatch) return { evaluation: JSON.parse(jsonMatch[0]) };
      }

      // Parsing Transcript vs Response
      let processedResponse = rawText;
      let transcript = null;

      const transcriptMatch = rawText.match(/Transcript:\s*([\s\S]*?)(?:Response:|$)/i);
      const responseMatch = rawText.match(/Response:\s*([\s\S]*)/i);

      if (transcriptMatch) transcript = transcriptMatch[1].trim();
      if (responseMatch) processedResponse = responseMatch[1].trim();

      // Ensure the "Transcript: [Audio Transmission]" in UI is replaced if we have a real transcript
      if (audioData && !transcript && !rawText.toLowerCase().includes("transcript:")) {
         transcript = "[Transcribing...]"; // Handled by standard response if needed
      }

      return { response: processedResponse, transcript };
    }, systemInstruction);

    // XP awarding if evaluation exists
    if (resultData.evaluation) {
      if (req.user && req.user._id) {
        const progress = await Progress.findOne({ user: req.user._id });
        if (progress) {
          const awardedXp = Math.round(200 * (progress.streakMultiplier || 1));
          progress.xp += awardedXp;
          progress.skills.softSkills = (progress.skills.softSkills || 0) + 5;
          await progress.save();
          resultData.evaluation.awardedXp = awardedXp;
        }
      }
    }
    
    return res.status(200).json({ success: true, ...resultData });

  } catch (error) {
    console.error("🔥 Interview Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message?.includes("Safety") ? "Safety filters triggered." : "Interview service unavailable."
    });
  }
};
