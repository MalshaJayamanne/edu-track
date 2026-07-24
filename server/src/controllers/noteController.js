import Note from "../models/Note.js";
import { generateGeminiResponse } from "../services/geminiService.js";

// CREATE NOTE
export const createNote = async (req, res) => {
  try {
    const { title, subject, content, tag, fileUrl } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: "Title and Subject required" });
    }

    const note = await Note.create({
      user: req.user._id,
      title,
      subject,
      content: content || "",
      tag: tag || "General",
      fileUrl: fileUrl || null,
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL NOTES (for current user)
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({
      pinned: -1,
      createdAt: -1,
    });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE NOTE (title, content, tag, subject, pinned)
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE NOTE
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SUMMARIZE NOTE
export const summarizeNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (!note.content) return res.status(400).json({ message: "Note content is empty" });

    const prompt = `You are an expert academic tutor. Summarize the following note content into key bullet points. Keep it clear, concise, and academically useful. Note title: ${note.title}. Note content: ${note.content}`;
    const summary = await generateGeminiResponse(prompt);

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GENERATE MCQS
export const generateMCQs = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (!note.content) return res.status(400).json({ message: "Note content is empty" });

    const prompt = `Based on the following note content, generate exactly 3 academic multiple choice questions (MCQs) to test student knowledge. Return the response strictly as a valid JSON array. Each element in the array must be an object with the following fields: "question" (string), "options" (array of 4 strings), and "answer" (string, which MUST be one of the options). Do not output markdown, HTML, or any other explanations. Only return raw JSON.
    Note Content: ${note.content}`;

    const rawResponse = await generateGeminiResponse(prompt);
    let mcqs;
    try {
      const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      mcqs = JSON.parse(cleaned);
    } catch (parseErr) {
      mcqs = { error: "Failed to parse AI generated MCQs", raw: rawResponse };
    }

    res.json({ mcqs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GENERATE FLASHCARDS
export const generateFlashcards = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (!note.content) return res.status(400).json({ message: "Note content is empty" });

    const prompt = `Based on the following note content, generate exactly 3 academic Q&A flashcards. Return the response strictly as a valid JSON array. Each element in the array must be an object with the following fields: "question" (string) and "answer" (string). Do not output markdown, HTML, or any other explanations. Only return raw JSON.
    Note Content: ${note.content}`;

    const rawResponse = await generateGeminiResponse(prompt);
    let flashcards;
    try {
      const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      flashcards = JSON.parse(cleaned);
    } catch (parseErr) {
      flashcards = { error: "Failed to parse AI generated flashcards", raw: rawResponse };
    }

    res.json({ flashcards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};