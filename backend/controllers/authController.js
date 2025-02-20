import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(500).send({
        success: false,
        message: "please provide All Fields",
      });
    }
    //Check existing user

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status.send({
        success: false,
        message: "user already exists",
      });
    }

    // save new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access (more secure)
      secure: process.env.NODE_ENV === "production", // Only secure in production (HTTPS required)
      sameSite: "Strict", // Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    });

    // Send user data  without the token in response body
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//logout
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // Required for HTTPS (Use false in development)
    sameSite: "None", // Required for cross-origin cookies
  });
  res.json({ message: "Logged out successfully" });
};

export { register, login, logout };
