import { GoogleGenerativeAI } from "@google/generative-ai";
import Progress from "../models/progress.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Robust AI Caller with Exponential Backoff + Model Fallback
 */
const callAILayer = async (taskFn, customSystemInstruction = null, generationConfig = {}) => {
  const models = ["gemini-2.5-flash", "gemini-3-flash", "gemini-1.5-flash"];
  let lastError;

  for (const modelName of models) {
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const config = { model: modelName };
        if (customSystemInstruction) config.systemInstruction = customSystemInstruction;
        
        const modelInstance = genAI.getGenerativeModel(config, { generationConfig });
        
        return await taskFn(modelInstance);
      } catch (error) {
        lastError = error;
        const isRateLimit = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("exhausted");
        
        if (isRateLimit && attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[Reliability] ${modelName} rate limited. Attempt ${attempt + 1}. Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        
        // If it's a model-not-found or persistent rate limit, fail over to the next model
        if (isRateLimit || error.message?.includes("not found") || error.message?.includes("404")) {
          console.warn(`[Reliability] ${modelName} failed. Switching to next model if available...`);
          break; // Break inner loop to try next model
        }
        
        throw error; // Other errors (Safety, Auth, etc) should fail fast
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

/**
 * Mock Interview Assistant
 */
export const mockInterview = async (req, res) => {
  const { career, history, resume, audioData, audioMimeType } = req.body;
  console.log(`[Interview] Session for user ${req.user?._id} in domain: ${career}. Audio: ${!!audioData}`);
  try {
    const questionCount = history ? history.filter(h => h.role === 'model').length : 0;
    const safeResume = resume && resume.length > 15000 ? resume.substring(0, 15000) + "..." : resume;

    const systemInstruction = `You are an elite, professional Tech Interviewer conducting a mock interview for the role: ${career}.
${safeResume ? `\nCandidate's Resume:\n${safeResume}\n` : ""}
RULES:
1. Conduct exactly 10 high-quality technical and behavioral questions.
2. Introduce yourself briefly and ask Question #1 immediately.
3. Keep each response under 80 words—conversational and direct.
4. Ask exactly ONE question at a time. Anchor questions in their resume.
5. After candidate answers Question #10, provide ONLY the evaluation JSON.
6. For every turn where audio is provided, you MUST start your response with "Transcript: [their words]" followed by "Response: [your question]".
7. If no clear speech is in the audio, use "Transcript: [Unintelligible/Silence]".

EVALUATION JSON:
{
  "overallScore": <0-100>,
  "scores": {"confidence": <0-100>, "clarity": <0-100>, "technicalSkills": <0-100>, "problemSolving": <0-100>},
  "feedback": "summary",
  "strengths": ["list"],
  "improvements": ["list"]
}
`;

    const resultData = await callAILayer(async (model) => {
      let chatHistory = history && history.length > 1 ? history.slice(0, -1) : [];
      
      // Sanitization: history must start with 'user'
      if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
        chatHistory = chatHistory.slice(1);
      }

      const chat = model.startChat({ history: chatHistory });
      
      const currentMessageText = history && history.length > 0
        ? history[history.length - 1].parts[0].text
        : "Start the interview. Introduce yourself briefly and ask Question #1.";

      const parts = [{ text: currentMessageText }];
      if (audioData) {
        parts.push({
          inlineData: {
            mimeType: audioMimeType || "audio/webm",
            data: audioData
          }
        });
      }

      const result = await chat.sendMessage(parts);
      const text = (await result.response).text().trim();
      
      // Evaluation Phase
      if (questionCount >= 10 || text.includes('"overallScore"')) {
        const jsonMatch = text.match(/\{[\s\S]*"overallScore"[\s\S]*\}/);
        if (jsonMatch) return { evaluation: JSON.parse(jsonMatch[0]) };
        
        // Force evaluation if needed
        if (questionCount >= 10) {
           const evalMsg = await chat.sendMessage("The interview is complete. Provide ONLY the evaluation JSON object.");
           const evalText = (await evalMsg.response).text().trim();
           const evalJson = evalText.match(/\{[\s\S]*"overallScore"[\s\S]*\}/);
           if (evalJson) return { evaluation: JSON.parse(evalJson[0]) };
        }
      }
      
      // Parsing Transcript vs Response
      let processedResponse = text;
      let transcript = null;

      if (text.includes("Transcript:") && text.includes("Response:")) {
        const parts = text.split("Response:");
        transcript = parts[0].replace("Transcript:", "").trim();
        processedResponse = parts[1].trim();
      }

      return { response: processedResponse, transcript: transcript };
    }, systemInstruction);

    // Xp awarding if evaluation exists
    if (resultData.evaluation) {
      const progress = await Progress.findOne({ user: req.user._id });
      if (progress) {
        const awardedXp = Math.round(200 * (progress.streakMultiplier || 1));
        progress.xp += awardedXp;
        progress.skills.softSkills = (progress.skills.softSkills || 0) + 5;
        await progress.save();
        resultData.evaluation.awardedXp = awardedXp;
      }
      return res.status(200).json({ success: true, evaluation: resultData.evaluation });
    }

    return res.status(200).json({ 
      success: true, 
      response: resultData.response, 
      transcript: resultData.transcript 
    });

  } catch (error) {
    console.error("🔥 Interview Error:", error.message);
    const msgMap = { 429: "AI rate limit reached.", SAFETY: "Safety filters triggered." };
    const userMessage = msgMap[error.message?.includes("429") ? 429 : "DEFAULT"] || "Interview service error.";
    res.status(500).json({ success: false, message: userMessage });
  }
};
