import express from "express";
import multer from "multer";
import {
  getUsers,
  updateProfile,
  getCurrentUser,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", authMiddleware, getUsers);
router.put("/update", authMiddleware, UploadStream.single('profilePic') updateProfile);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
