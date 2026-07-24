import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    title: String,
    code: String,
    lecturer: String,
    semester: Number,
    credits: Number,

    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard", "Very Hard"],
      default: "Moderate",
    },

    grade: {
      type: String,
      enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "F", "Ongoing"],
      default: "Ongoing",
    },

    gradePoint: {
      type: Number,
      default: 2.0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);