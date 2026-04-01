import express from "express";
import { getPortfolio } from "../controllers/portfolio.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/me", getPortfolio);

export default router;
