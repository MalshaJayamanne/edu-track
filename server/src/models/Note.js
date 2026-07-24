import mongoose from "mongoose";

const NOTE_TAGS = ["General", "Lecture", "Lab", "Assignment", "Exam"];

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    tag: {
      type: String,
      enum: NOTE_TAGS,
      default: "General",
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    fileUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);