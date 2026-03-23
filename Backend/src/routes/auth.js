import express from "express";
import { register, login, logout, getProfile, updateProfile } from "../controllers/auth.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getProfile);
router.put("/update-profile", authMiddleware, updateProfile)

export default router;