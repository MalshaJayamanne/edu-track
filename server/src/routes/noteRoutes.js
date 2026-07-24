import express from "express";

import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  summarizeNote,
  generateMCQs,
  generateFlashcards,
} from "../controllers/noteController.js";

import { protect, checkAICredits } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createNote);
router.get("/", protect, getNotes);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

router.post("/:id/summarize", protect, checkAICredits, summarizeNote);
router.post("/:id/mcqs", protect, checkAICredits, generateMCQs);
router.post("/:id/flashcards", protect, checkAICredits, generateFlashcards);

export default router;