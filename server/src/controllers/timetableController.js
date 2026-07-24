import Timetable from "../models/Timetable.js";

// CREATE SLOT
export const createSlot = async (req, res) => {
  try {
    const slot = await Timetable.create({
      ...req.body,
      user: req.user._id,
    });

    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
export const getSlots = async (req, res) => {
  try {
    const slots = await Timetable.find({ user: req.user._id });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateSlot = async (req, res) => {
  try {
    const { subject, day, startTime, endTime, type } = req.body;

    if (startTime && endTime && startTime >= endTime) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    const slot = await Timetable.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { subject, day, startTime, endTime, type },
      { new: true, runValidators: true }
    );

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteSlot = async (req, res) => {
  try {
    const deleted = await Timetable.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};