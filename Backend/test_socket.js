import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  
  socket.emit("join_channel", "sd");
  
  socket.on("chat_history", (history) => {
    console.log("Got history:", history.length, "messages");
    
    // Try sending a message
    socket.emit("send_message", {
      channelId: "sd",
      userId: "60b9b0b9e6b3f3b3b4b4b4b4", // fake valid objectid
      text: "Test script message"
    });
  });

  socket.on("receive_message", (msg) => {
    console.log("Received broadcast:", msg);
    process.exit(0);
  });
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log("Timeout");
  process.exit(1);
}, 5000);
