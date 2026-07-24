import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import gpaRoutes from "./routes/gpaRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import studyPlanRoutes from "./routes/studyPlanRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/gpa", gpaRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Running..." });
});

export default app;