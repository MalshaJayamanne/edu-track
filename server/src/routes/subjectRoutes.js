import express from "express";
import {
  addSubject,
  getSubjects,
  getSubject,
  editSubject,
  removeSubject
} from "../controllers/subjectController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addSubject);
router.get("/", protect, getSubjects);
router.get("/:id", protect, getSubject);
router.put("/:id", protect, editSubject);
router.delete("/:id", protect, removeSubject);

export default router;