import express from "express";
import { getUsers, updateProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.put("/update", authMiddleware, updateProfile);

export default router;
