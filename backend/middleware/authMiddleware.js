import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; // 👈 Fetch token from cookies

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging Step

    const user = await User.findById(decoded.userId); // 👈 Fetch full user from DB

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // ✅ Attach full user object to req.user
    console.log("User attached to request:", req.user); // Debugging Step

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
