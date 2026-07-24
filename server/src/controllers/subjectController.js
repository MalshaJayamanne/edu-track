import {
  createSubject,
  getSubjectsByUser,
  getSubjectById,
  updateSubject,
  deleteSubject
} from "../services/subjectService.js";

import { validateSubject } from "../validations/subjectValidation.js";
import Assignment from "../models/Assignment.js";

// CREATE
export const addSubject = async (req, res) => {
  try {
    const errors = validateSubject(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const subject = await createSubject({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
export const getSubjects = async (req, res) => {
  try {
    const data = await getSubjectsByUser(req.user._id);
    const assignments = await Assignment.find({ user: req.user._id });

    const enriched = data.map((subject) => {
      const subjectObj = subject.toObject();

      const subAssignments = assignments.filter((a) => {
        const moduleLower = (a.module || "").toLowerCase().trim();
        const titleLower = (subject.title || "").toLowerCase().trim();
        const codeLower = (subject.code || "").toLowerCase().trim();
        return moduleLower === titleLower || moduleLower === codeLower;
      });

      const pending = subAssignments.filter((a) => a.status !== "Completed");
      const overdue = pending.filter((a) => new Date(a.dueDate) < new Date());

      let riskLevel = "Low";
      if (subject.grade === "Ongoing") {
        if (overdue.length > 0) {
          riskLevel = "High";
        } else if (subject.difficulty === "Very Hard" && pending.length > 0) {
          riskLevel = "High";
        } else if (subject.difficulty === "Hard" && pending.length > 0) {
          riskLevel = "Medium";
        } else if (pending.some(p => p.progress < 50 && (new Date(p.dueDate) - new Date()) / 86400000 < 3)) {
          riskLevel = "High";
        } else if (pending.length > 0) {
          riskLevel = "Medium";
        }
      } else {
        if (subject.grade === "F") riskLevel = "High";
        else if (subject.grade === "C" || subject.grade === "C+") riskLevel = "Medium";
      }

      return {
        ...subjectObj,
        riskLevel,
        pendingAssignmentsCount: pending.length,
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONE
export const getSubject = async (req, res) => {
  try {
    const data = await getSubjectById(req.params.id, req.user._id);
    if (!data) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const assignments = await Assignment.find({ user: req.user._id });
    const subAssignments = assignments.filter((a) => {
      const moduleLower = (a.module || "").toLowerCase().trim();
      const titleLower = (data.title || "").toLowerCase().trim();
      const codeLower = (data.code || "").toLowerCase().trim();
      return moduleLower === titleLower || moduleLower === codeLower;
    });

    const pending = subAssignments.filter((a) => a.status !== "Completed");
    const overdue = pending.filter((a) => new Date(a.dueDate) < new Date());

    let riskLevel = "Low";
    if (data.grade === "Ongoing") {
      if (overdue.length > 0) {
        riskLevel = "High";
      } else if (data.difficulty === "Very Hard" && pending.length > 0) {
        riskLevel = "High";
      } else if (data.difficulty === "Hard" && pending.length > 0) {
        riskLevel = "Medium";
      } else if (pending.some(p => p.progress < 50 && (new Date(p.dueDate) - new Date()) / 86400000 < 3)) {
        riskLevel = "High";
      } else if (pending.length > 0) {
        riskLevel = "Medium";
      }
    } else {
      if (data.grade === "F") riskLevel = "High";
      else if (data.grade === "C" || data.grade === "C+") riskLevel = "Medium";
    }

    res.json({
      ...data.toObject(),
      riskLevel,
      pendingAssignmentsCount: pending.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const editSubject = async (req, res) => {
  try {
    const data = await updateSubject(req.params.id, req.user._id, req.body);
    if (!data) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const removeSubject = async (req, res) => {
  try {
    const data = await deleteSubject(req.params.id, req.user._id);
    if (!data) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};