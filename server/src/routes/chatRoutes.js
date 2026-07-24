import express from "express";
import { protect, checkAICredits } from "../middleware/authMiddleware.js";
import { chatWithAI } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", protect, checkAICredits, chatWithAI);

export default router;