import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { Server } from "socket.io";

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

// Ephemeral in-memory chat history per channel (keeps last 50 msgs)
const chatHistory = {
  "sd": [],
  "ai": [],
  "devops": [],
  "cp": []
};

// Socket logic
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a specific channel
  socket.on("join_channel", (channelId) => {
    socket.join(channelId);
    
    // Send history to user who just joined
    if(chatHistory[channelId]) {
      socket.emit("chat_history", chatHistory[channelId]);
    }
  });

  // Handle incoming messages
  socket.on("send_message", ({ channelId, messageData }) => {
    const enrichedMsg = {
      ...messageData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    };

    // Store in history
    if (!chatHistory[channelId]) chatHistory[channelId] = [];
    chatHistory[channelId].push(enrichedMsg);
    
    // Keep only last 50 msgs
    if (chatHistory[channelId].length > 50) {
      chatHistory[channelId].shift();
    }

    // Broadcast to the channel
    io.to(channelId).emit("receive_message", enrichedMsg);
  });

  // Handle updating messages
  socket.on("update_message", ({ channelId, messageId, newText }) => {
    if (chatHistory[channelId]) {
      const msg = chatHistory[channelId].find(m => m.id === messageId);
      if (msg) {
        msg.text = newText;
        msg.isEdited = true;
        
        // Broadcast the update to everyone in the room
        io.to(channelId).emit("message_updated", { messageId, newText });
      }
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
