import express from "express";
import { studyBuddyChat, generateQuiz, mockInterview } from "../controllers/ai.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

router.post("/buddy", studyBuddyChat);
router.post("/quiz", generateQuiz);
router.post("/interview", mockInterview);

export default router;
