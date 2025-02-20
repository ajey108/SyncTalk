import express from "express";
import {
  getUsers,
  updateProfile,
  getCurrentUser,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.put("/update", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
