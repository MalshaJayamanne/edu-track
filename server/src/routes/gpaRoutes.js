import express from "express";
import { getGPA } from "../controllers/gpaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getGPA);

export default router;

