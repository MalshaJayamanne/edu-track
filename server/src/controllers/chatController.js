import Subject from "../models/Subject.js";
import { generateGeminiResponse } from "../services/geminiService.js";
import { buildStudentContext } from "../utils/buildContext.js";
import { getMemory, addToMemory } from "../utils/chatMemory.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    // ================= VALIDATION =================
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userId = req.user._id.toString();

    const subjects = await Subject.find({
      createdBy: req.user._id,
    });

    // ================= GPA CALCULATION =================
    const totalPoints = subjects.reduce(
      (sum, s) => sum + (s.gradePoint || 2) * (s.credits || 1),
      0
    );

    const totalCredits = subjects.reduce(
      (sum, s) => sum + (s.credits || 1),
      0
    );

    const gpa = totalCredits ? totalPoints / totalCredits : 0;

    // ================= CONTEXT =================
    const context = buildStudentContext(subjects, gpa);

    // ================= MEMORY (pre-update) =================
    const history = getMemory(userId);

    addToMemory(userId, "user", message.trim());

    // ================= PROMPT =================
    const fullPrompt = `
${context}

CHAT HISTORY:
${history.map((h) => `${h.role}: ${h.text}`).join("\n")}

USER QUESTION:
${message.trim()}
`;

    // ================= GEMINI RESPONSE =================
    const reply = await generateGeminiResponse(fullPrompt);

    addToMemory(userId, "ai", reply);

    // ================= MEMORY (post-update, returned to client) =================
    const updatedHistory = getMemory(userId);

    // ================= RESPONSE =================
    res.json({
      reply,
      gpa: Number(gpa.toFixed(2)),
      history: updatedHistory,
    });
  } catch (err) {
    console.error("Chat controller error:", err.message);
    res.status(500).json({ message: err.message || "Something went wrong. Please try again." });
  }
};