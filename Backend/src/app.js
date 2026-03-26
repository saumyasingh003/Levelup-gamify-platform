import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import roadmapRoutes from "./routes/roadmap.js";
import progressRoutes from "./routes/progress.js";
import todoRoutes from "./routes/todo.js";
import communityRoutes from "./routes/community.js";

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
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/progress", progressRoutes);
app.use("/roadmap", roadmapRoutes);
app.use("/todo", todoRoutes);
app.use("/community", communityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
    stack: err.stack,
  });
});

export default app;
