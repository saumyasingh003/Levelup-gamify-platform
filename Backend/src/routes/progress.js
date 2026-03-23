import express from "express";
import authMiddleware from "../middleware/auth.js";
import { selectCareer, getProgress, toggleTopic } from "../controllers/progress.js";

const router = express.Router();

router.post("/career", authMiddleware, selectCareer);
router.post("/toggle", authMiddleware, toggleTopic);
router.get("/", authMiddleware, getProgress);

export default router;
