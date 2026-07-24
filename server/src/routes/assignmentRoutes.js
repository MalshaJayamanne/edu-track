import express from "express";

import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  getAIPrioritizedAssignments
} from "../controllers/assignmentController.js";

import { protect, checkAICredits } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAssignment);
router.get("/", protect, getAssignments);
router.get("/ai-prioritization", protect, checkAICredits, getAIPrioritizedAssignments);
router.put("/:id", protect, updateAssignment);
router.delete("/:id", protect, deleteAssignment);

export default router;