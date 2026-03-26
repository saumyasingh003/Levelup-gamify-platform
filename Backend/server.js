import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { Server } from "socket.io";
import Message from "./src/models/message.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping Express
const server = http.createServer(app);

// Initialize Socket.io with identical CORS to Express app
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "https://levelup-gamify-frontend.vercel.app",
      "https://levelup-gamify-platform.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Socket logic
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a specific channel
  socket.on("join_channel", async (channelId) => {
    socket.join(channelId);
    
    try {
      // Fetch last 50 messages from DB
      const history = await Message.find({ channelId })
        .sort({ createdAt: -1 }) // newest first
        .limit(50)
        .populate("user", "name"); // grab the user's name
      
      // Reverse to chronological order (oldest to newest)
      const formattedHistory = history.reverse().map(msg => ({
        id: msg._id,
        user: msg.user?.name || "Unknown User",
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: msg.text
      }));

      socket.emit("chat_history", formattedHistory);
    } catch (err) {
      console.error("❌ DB history error:", err);
    }
  });

  // Handle incoming messages
  socket.on("send_message", async ({ channelId, userId, text }) => {
    try {
      // 1. Save to DB
      const newMsg = await Message.create({
        channelId,
        user: userId,
        text
      });

      // 2. Populate user to get name
      await newMsg.populate("user", "name");

      // 3. Format for frontend
      const enrichedMsg = {
        id: newMsg._id,
        user: newMsg.user?.name || "Unknown User",
        time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: newMsg.text
      };

      // 4. Broadcast to the channel
      io.to(channelId).emit("receive_message", enrichedMsg);
    } catch(err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
