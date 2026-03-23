import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import roadmapRoutes from "./routes/roadmap.js";
import progressRoutes from "./routes/progress.js";
import todoRoutes from "./routes/todo.js";

const app = express();
app.use(
  cors(),
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/progress", progressRoutes);
app.use("/roadmap", roadmapRoutes);
app.use("/todo", todoRoutes);

export default app;
