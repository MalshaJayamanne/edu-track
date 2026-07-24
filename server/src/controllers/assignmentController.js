import Assignment from "../models/Assignment.js";
import { generateGeminiResponse } from "../services/geminiService.js";

// VALIDATION HELPER
const validateAssignment = (data) => {
  if (!data.title || !data.module || !data.dueDate) {
    return "Title, Module, and Due Date are required";
  }

  if (data.weightage < 0 || data.weightage > 100) {
    return "Weightage must be between 0 and 100";
  }

  return null;
};

// CREATE
export const createAssignment = async (req, res) => {
  try {
    const error = validateAssignment(req.body);
    if (error) return res.status(400).json({ message: error });

    const assignment = await Assignment.create({
      ...req.body,
      user: req.user._id,
    });

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET
export const getAssignments = async (req, res) => {
  try {
    const data = await Assignment.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// AUTO STATUS LOGIC
const calculateStatus = (progress) => {
  if (progress >= 100) return "Completed";
  if (progress > 0) return "In Progress";
  return "Pending";
};

// UPDATE
export const updateAssignment = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.progress !== undefined) {
      updateData.status = calculateStatus(updateData.progress);
    }

    const updated = await Assignment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteAssignment = async (req, res) => {
  try {
    const deleted = await Assignment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// AI PRIORITIZATION SUGGESTIONS
export const getAIPrioritizedAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id, status: { $ne: "Completed" } });

    if (!assignments.length) {
      return res.json({
        recommendations: "You have no pending assignments! Great job! 🎉",
        prioritized: []
      });
    }

    const enriched = assignments.map((a) => {
      const daysLeft = Math.max(0, Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24)));
      const urgencyScore = daysLeft === 0 ? 10 : Math.max(1, 10 - daysLeft);
      const importanceScore = (a.weightage || 0) / 10;
      const priorityScore = urgencyScore * 1.5 + importanceScore;

      return {
        ...a.toObject(),
        daysLeft,
        priorityScore,
      };
    });

    const sorted = enriched.sort((a, b) => b.priorityScore - a.priorityScore);

    const assignmentsText = sorted
      .map(
        (a) =>
          `- ${a.title} (Module: ${a.module}, Due in: ${a.daysLeft} days, Weight: ${a.weightage}%, Progress: ${a.progress}%)`
      )
      .join("\n");

    const prompt = `You are an AI study assistant. Below is a list of pending assignments for a student, sorted by calculated academic priority:
${assignmentsText}

Please provide a concise, high-impact study action plan (maximum 4 bullet points) detailing which assignment to focus on first and how the student should manage their time to meet these deadlines. Keep it encouraging and highly actionable.`;

    const recommendations = await generateGeminiResponse(prompt);

    res.json({
      recommendations,
      prioritized: sorted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};