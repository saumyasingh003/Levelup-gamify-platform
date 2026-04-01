import express from "express";
import { submitQuiz } from "../controllers/quiz.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/submit", submitQuiz);

export default router;
