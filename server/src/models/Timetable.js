import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },

    startTime: {
      type: String,
      required: true, // "10:00"
    },

    endTime: {
      type: String,
      required: true, // "12:00"
    },

    type: {
      type: String,
      enum: ["Lecture", "Lab", "Study", "Exam"],
      default: "Lecture",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);