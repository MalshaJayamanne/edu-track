import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { generateStudyPlan } from "../controllers/studyPlanController.js";

const router = express.Router();

router.get("/", protect, generateStudyPlan);

export default router;