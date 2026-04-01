import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { Server } from "socket.io";
import Message from "./src/models/message.js";
import User from "./src/models/user.js";

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

// Persistent chat history via MongoDB

// Socket logic
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a specific channel
  socket.on("join_channel", async (channelId) => {
    // Leave previous rooms (except own ID)
    socket.rooms.forEach(room => {
      if(room !== socket.id) {
        socket.leave(room);
        const count = (io.sockets.adapter.rooms.get(room)?.size || 1) - 1;
        io.to(room).emit("online_count", { channelId: room, count: Math.max(0, count) });
      }
    });

    socket.join(channelId);
    
    // Broadcast updated count to everyone in the channel
    const count = io.sockets.adapter.rooms.get(channelId)?.size || 0;
    io.to(channelId).emit("online_count", { channelId, count });

    try {
      // Fetch last 50 messages for this channel
      const history = await Message.find({ channelId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("user", "name"); // Populate user name

      // Reverse to get chronological order
      socket.emit("chat_history", history.reverse());
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  });

  // Handle incoming messages
  socket.on("send_message", async ({ channelId, messageData }) => {
    try {
      const { userId, text, fileUrl, fileType } = messageData;

      const newMessage = new Message({
        channelId,
        user: userId,
        text,
        fileUrl,
        fileType
      });

      const savedMsg = await newMessage.save();
      const populatedMsg = await savedMsg.populate("user", "name");

      // Broadcast to the channel
      io.to(channelId).emit("receive_message", populatedMsg);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle updating messages
  socket.on("update_message", async ({ channelId, messageId, newText }) => {
    try {
      const updatedMsg = await Message.findByIdAndUpdate(
        messageId,
        { text: newText },
        { new: true }
      ).populate("user", "name");

      if (updatedMsg) {
        // Broadcast the update to everyone in the room
        io.to(channelId).emit("message_updated", { 
          messageId: updatedMsg._id, 
          newText: updatedMsg.text 
        });
      }
    } catch (err) {
      console.error("Error updating message:", err);
    }
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => {
      if(room !== socket.id) {
        const count = (io.sockets.adapter.rooms.get(room)?.size || 1) - 1;
        io.to(room).emit("online_count", { channelId: room, count: Math.max(0, count) });
      }
    });
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
