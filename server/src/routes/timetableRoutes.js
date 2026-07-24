import express from "express";

import {
  createSlot,
  getSlots,
  updateSlot,
  deleteSlot,
} from "../controllers/timetableController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSlot);
router.get("/", protect, getSlots);
router.put("/:id", protect, updateSlot);
router.delete("/:id", protect, deleteSlot);

export default router;