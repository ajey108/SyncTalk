import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoute from "./routes/messageRoute.js";
import userRoute from "./routes/userRoute.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { createServer } from "http";
import { Server } from "socket.io";
import setupSocket from "./socket/socket.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:4173",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://synctalk-frontend.onrender.com",
];

console.log("allowed orgs", allowedOrigins);
const io = new Server(server);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, "./backend/public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../backend/public", "index.html"));
});

// check route
app.get("/", (req, res) => {
  res.send("SyncTalk backend is running!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoute);
app.use("/api/users", userRoute);

// Initialize Socket.io
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
