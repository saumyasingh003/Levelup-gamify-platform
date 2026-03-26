import express from "express";
import { getLeaderboard } from "../controllers/community.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/leaderboard", authMiddleware, getLeaderboard);

export default router;
