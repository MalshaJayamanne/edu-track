import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGPAAnalytics,
} from "../controllers/analyticsController.js";

const router = express.Router();

// GET /api/analytics/gpa
router.get("/gpa", protect, getGPAAnalytics);

export default router;