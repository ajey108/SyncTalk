import { Server } from "socket.io";
import Message from "../models/messages.js";

export default function setupSocket(server) {
  console.log("Socket server is being initialized...");

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:4173",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://synctalk-backend.onrender.com",
  ];

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS (Socket.IO)"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Store userId -> socketId mapping
  const users = {};
  console.log("users from setupsocket", users);

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // When a user joins, store their socket ID
    socket.on("join", (userId) => {
      if (!userId) {
        console.log("join event received without userId!");
        return;
      }

      users[userId] = socket.id;
      socket.join(userId);
      console.log(`User ${userId} joined. Updated users list:`, users);
      io.emit("getOnlineUsers", Object.keys(users));
    });

    // Send message
    socket.on("sendMessage", (message) => {
      const receiverSocketId = users[message.receiver];
      console.log(
        `Sending message to ${message.receiver}: ${receiverSocketId}`
      );

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      } else {
        console.log(`Receiver ${message.receiver} is not online`);
      }
    });

    // Typing indicators
    socket.on("typing", ({ from, to }) => {
      const receiverSocketId = users[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { from });
      }
    });

    socket.on("stopTyping", ({ from, to }) => {
      const receiverSocketId = users[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { from });
      }
    });

    //  Seen/unseen
    socket.on("markAsSeen", async ({ senderId, receiverId }) => {
      try {
        await Message.updateMany(
          { sender: senderId, receiver: receiverId, seen: false },
          { $set: { seen: true } }
        );

        // Notify sender
        const senderSocketId = users[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesSeen", { by: receiverId });
        }

        console.log(
          `Messages from ${senderId} to ${receiverId} marked as seen`
        );
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      const userId = Object.keys(users).find((key) => users[key] === socket.id);
      if (userId) {
        delete users[userId];
        io.emit("getOnlineUsers", Object.keys(users));
      }
      console.log("User Disconnected:", socket.id);
    });
  });
}
