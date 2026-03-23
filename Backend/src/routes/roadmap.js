import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getUserRoadmap } from "../controllers/roadmap.js";

const router = express.Router();

// single route → generate + fetch roadmap for logged in user
router.get("/", authMiddleware, getUserRoadmap);

export default router;
