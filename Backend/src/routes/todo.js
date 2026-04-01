import express from "express";
import authMiddleware from "../middleware/auth.js";
import { generateTodoPlan, getSavedPlan, deleteSavedPlan } from "../controllers/todo.js";

const router = express.Router();

// POST → generate AI todo plan (daily / weekly)
router.post("/generate", authMiddleware, generateTodoPlan);

// GET → retrieve a saved plan by type
router.get("/plan/:planType", authMiddleware, getSavedPlan);

// DELETE → remove a saved plan (regenerate flow)
router.delete("/plan/:planType", authMiddleware, deleteSavedPlan);

export default router;
