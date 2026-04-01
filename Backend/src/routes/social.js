import express from "express";
import { requestReview, getPendingReviews, completeReview } from "../controllers/review.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/request", requestReview);
router.get("/pending", getPendingReviews);
router.post("/complete", completeReview);

export default router;
