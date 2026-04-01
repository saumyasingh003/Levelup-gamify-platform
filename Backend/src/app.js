import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import roadmapRoutes from "./routes/roadmap.js";
import progressRoutes from "./routes/progress.js";
import todoRoutes from "./routes/todo.js";
import communityRoutes from "./routes/community.js";
import aiRoutes from "./routes/ai.js";
import socialRoutes from "./routes/social.js";
import quizRoutes from "./routes/quiz.js";
import portfolioRoutes from "./routes/portfolio.js";
import resumeRoutes from "./routes/resume.js";
import morgan from "morgan";

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://levelup-gamify-frontend.vercel.app",
        "https://levelup-gamify-platform.vercel.app"
      ];
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(morgan("dev")); // Request logging
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/progress", progressRoutes);
app.use("/roadmap", roadmapRoutes);
app.use("/todo", todoRoutes);
app.use("/community", communityRoutes);
app.use("/ai", aiRoutes);
app.use("/social", socialRoutes);
app.use("/quiz", quizRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/resume", resumeRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[${new Date().toISOString()}] 🔥 ERROR [${req.method} ${req.url}]:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    user: req.user?._id
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
