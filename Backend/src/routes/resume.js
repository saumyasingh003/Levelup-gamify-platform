import express from "express";
import { getResumes, uploadResume, deleteResume } from "../controllers/resume.js";
import authenticate from "../middleware/auth.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const router = express.Router();

router.use(authenticate);

router.get("/", getResumes);
router.post("/upload", upload.single("file"), uploadResume);
router.delete("/:id", deleteResume);

export default router;
