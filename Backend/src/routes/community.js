import express from "express";
import { getLeaderboard } from "../controllers/community.js";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/leaderboard", authMiddleware, getLeaderboard);

// File upload route
router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ 
    success: true, 
    fileUrl, 
    fileType: req.file.mimetype 
  });
});

export default router;
