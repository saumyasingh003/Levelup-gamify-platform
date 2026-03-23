import express from "express";
import authMiddleware from "../middleware/auth.js";
import { generateTodoPlan } from "../controllers/todo.js";

const router = express.Router();

// POST → generate AI todo plan (daily / weekly / monthly)
router.post("/generate", authMiddleware, generateTodoPlan);

export default router;
