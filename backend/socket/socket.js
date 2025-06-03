import { Server } from "socket.io";

export default function setupSocket(server) {
  console.log("Socket server is being initialized...");

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:4173",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://synctalk-frontend.onrender.com",
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
    });

    // Send message to the correct receiver
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

    // Remove user from tracking on disconnect
    socket.on("disconnect", () => {
      const userId = Object.keys(users).find((key) => users[key] === socket.id);
      if (userId) {
        delete users[userId];
      }
      console.log("User Disconnected:", socket.id);
    });
  });
}
