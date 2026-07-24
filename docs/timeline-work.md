# 🗓️ EduTrack AI — Development Timeline (Detailed Plan)

This document defines a structured, week-by-week execution plan for building the EduTrack AI full-stack academic management system using the MERN stack.

The goal is to build a production-style, scalable, and portfolio-ready application.

---

# 🚀 WEEK 1 — FOUNDATION (SYSTEM SETUP + AUTH)

## 🎯 Objective
Establish a secure backend + frontend architecture with authentication.

---

## 🧠 Backend Tasks

### 1. Project Initialization
- Initialize Node.js project
- Setup Express server
- Configure folder structure (MVC pattern)

### 2. Database Setup
- Setup MongoDB Atlas cluster
- Connect MongoDB using Mongoose
- Create database connection module

### 3. User Authentication System
- Create User model (name, email, password)
- Password hashing using bcryptjs
- JWT token generation utility

### 4. Authentication APIs
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`

### 5. Security Layer
- HTTP-only cookies
- JWT authentication middleware (protect routes)
- CORS configuration
- Helmet security middleware (optional enhancement)

---

## 💻 Frontend Tasks

### 1. React Setup
- Initialize React (Vite)
- Install dependencies (axios, router, etc.)

### 2. Routing System
- Setup React Router DOM
- Create base routes:
  - `/` → Home
  - `/login`
  - `/register`
  - `/dashboard`

### 3. Authentication System
- Create Auth Context API
- Store user session state
- Implement login/register functions
- Setup API service layer (axios)

### 4. Protected Routes
- Create ProtectedRoute component
- Restrict dashboard access

---

## ✅ WEEK 1 OUTCOME — COMPLETED ✅

✔ Full authentication system (register, login, logout, session restore via /auth/me)
✔ Secure JWT + HTTP-only cookie implementation
✔ Working frontend routing with ProtectedRoute
✔ Backend API structure ready (MVC pattern, ES Modules)
✔ AuthContext with loading state and session persistence on page refresh

---

# 📚 WEEK 2 — SUBJECT MANAGEMENT MODULE (CORE SYSTEM)

## 🎯 Objective
Build the main academic data layer of the system.

---

## 🧠 Backend Tasks

### 1. Subject Data Model
Create Subject schema:
- title (subject name)
- code (subject code)
- lecturer
- semester
- credits
- difficulty level
- color tag
- createdBy (user reference)

---

### 2. Subject API Layer

Implement CRUD APIs:

- POST `/subjects` → Create subject
- GET `/subjects` → Get all subjects (by user)
- GET `/subjects/:id` → Get single subject
- PUT `/subjects/:id` → Update subject
- DELETE `/subjects/:id` → Delete subject

---

### 3. Business Logic Layer
- Service layer for database operations
- Validation layer for input checking
- Ensure user-based data isolation

---

### 4. Security
- Protect all subject routes using JWT middleware
- Ensure users only access their own subjects

---

## 💻 Frontend Tasks

### 1. Subjects Page
- Create Subjects.jsx page
- Layout for subject listing

### 2. UI Components
- Subject Card component
- Add Subject / Edit Subject modal
- Difficulty badge (Easy / Moderate / Hard / Very Hard)

### 3. API Integration
- Connect frontend to backend APIs using Axios
- CRUD operations fully wired

---

## 📊 WEEK 2 OUTCOME — COMPLETED ✅

✔ Full Subject Management System
✔ CRUD operations complete with validation errors
✔ Data isolated per authenticated user
✔ UI connected to backend with polished modal

---

# 📊 WEEK 3 — DASHBOARD & ANALYTICS

## 🎯 Objective
Provide insights into academic performance.

---

## Features

### Backend
- Aggregated KPIs: totalSubjects, totalCredits, avgCredits
- Difficulty distribution per category
- Semester distribution array
- AI insight string

### Frontend
- StatCard KPI components
- DifficultyChart (donut via Recharts)
- SemesterChart (bar chart via Recharts)
- RecentSubjects sidebar list
- InsightCard AI tip

---

## Outcome — COMPLETED ✅

✔ Full academic overview dashboard
✔ Interactive Recharts visualizations
✔ AI-generated academic insight
✔ Polished DashboardCard, DifficultyChart, SemesterChart components

---

# 📝 WEEK 4 — ASSIGNMENT TRACKER

## Features

- Assignment creation (title, module, due date, weightage)
- Due date countdown ("3d left", "Overdue", "Due today!")
- Progress slider (0–100%) with animated progress bar
- Auto status update (Pending → In Progress → Completed)
- Delete with confirmation

---

## Backend Files
- `models/Assignment.js`
- `controllers/assignmentController.js`
- `routes/assignmentRoutes.js`
- Registered in `app.js` at `/api/assignments`

## Frontend Files
- `pages/Assignments.jsx` — full polished UI with modal, progress bars, status badges

## Outcome — COMPLETED ✅

✔ Assignment CRUD system fully working
✔ Visual progress tracker with auto-status
✔ Day countdown labels (overdue, today, N days left)
✔ Premium card UI with status colour badges

---

# 📅 WEEK 5 — TIMETABLE SYSTEM

## Features

- Weekly timetable grid (Mon–Sun columns)
- Add time slots (subject, day, start/end time, type)
- Session types: Lecture / Lab / Study / Exam (colour-coded)
- Hover-to-delete on each slot
- Sorted by start time within each day

---

## Backend Files
- `models/Timetable.js`
- `controllers/timetableController.js`
- `routes/timetableRoutes.js`
- Registered in `app.js` at `/api/timetable`

## Frontend Files
- `pages/Timetable.jsx` — 7-column grid, coloured type badges, hover delete

## Outcome — COMPLETED ✅

✔ Smart weekly timetable fully functional
✔ Colour-coded session types (Lecture=Blue, Lab=Purple, Study=Green, Exam=Red)
✔ Slots sorted by time, hover-delete UX

---

# 📚 WEEK 6 — NOTES SYSTEM + GPA CALCULATOR

## 🎯 Objective
Build a digital notes repository and a comprehensive multi-semester GPA analytics system.

---

## Notes System Features
- CRUD notes (create, edit, delete, pin)
- Subject-based organization
- Tag system (General, Lecture, Lab, Assignment, Exam)
- Search by title / content / subject
- Filter by tag and subject
- Sort by Newest / Oldest / Pinned
- Pin/star toggle with visual indicator

## Backend Files
- `models/Note.js` — Added `tag` (enum) and `pinned` (boolean) fields
- `controllers/noteController.js` — Added `updateNote` (was missing)
- `routes/noteRoutes.js` — Added `PUT /:id` route (was missing)

---

## GPA Calculator Features (Week 6 Addition)

### Multi-Semester Support
- Subjects grouped by semester number
- Per-semester GPA card with animated ring gauge
- Semester navigation tabs showing each semester's subject table
- CGPA (cumulative GPA) across all semesters
- Semester GPA trend line chart

### Analytics UI
- CGPA ring gauge (color-coded: green ≥ 3.7, blue ≥ 3.0, amber ≥ 2.0, red < 2.0)
- Grade distribution bar chart (per grade letter)
- Grade breakdown donut/pie chart
- Performance badge (Distinction / Merit / Pass / At Risk)

### What-If Calculator
- Simulate adding a hypothetical subject
- Shows projected new CGPA and delta (▲ / ▼) from current

### Manage Current Semester
- Dropdown to set "current semester" stored in localStorage
- Current semester badge shown in tabs and semester summary list
- Available app-wide via localStorage key `currentSemester`

### Subject Form (Subjects page)
- Added Grade field (A+, A, A-, B+, B, B-, C+, C, F)
- Auto-computes gradePoint from selected grade
- Displays grade and grade point on subject card

## Backend Files
- `controllers/gpaController.js` — Full rewrite: CGPA, per-semester breakdown, grade chart data, trend data
- `routes/gpaRoutes.js` — `GET /api/gpa` returns all analytics in one call

## Frontend Files
- `pages/GPA.jsx` — Complete redesign with all above features
- `pages/Subjects.jsx` — Added grade selector to add/edit form

## Bug Fixes Applied This Week
- `Note.js` — Added missing `tag` and `pinned` fields (pin toggle was silently failing)
- `noteController.js` — Added `updateNote` (edit was silently failing)
- `noteRoutes.js` — Added `PUT /:id` (405 error on edit)
- `Assignment.js` — Made `weightage` optional (was rejecting assignments with no weightage)
- `dashboardController.js` — Fixed `insight`/`insights` field mismatch; added `insights.hardestSubject`, `insights.focusSubject`; added `insights.riskLevel` nested; removed stale `gpaTrend` simulation
- `Dashboard.jsx` — Fixed `data.insights.*` references
- `Analytics.jsx` — Fixed `data.insight` fallback text
- `Navbar.jsx` — Added `/gpa` entry to `PAGE_TITLES`

## Outcome — COMPLETED ✅

✔ Digital notes repository (CRUD + pin + tag + filter + search)  
✔ Full GPA Calculator with multi-semester analytics  
✔ CGPA ring gauge + per-semester tabs + grade charts  
✔ What-if GPA simulator  
✔ Manage current semester (persisted in localStorage)  
✔ All known bugs and inconsistencies resolved  

---

# 🤖 WEEK 7 — AI MODULE + SEMESTER-WISE ORGANIZATION

## 🎯 Objective
Integrate AI capabilities, restructure the platform with semester-wise data isolation, and apply a premium SaaS-grade UI redesign.

## ✅ AI Features Implemented

### Notes AI (Gemini-powered)
- **Note Summarizer** — Condenses long notes into key academic bullet points
- **MCQ Generator** — Generates 3 interactive practice questions with answer reveal
- **Flashcard Generator** — Generates Q&A flashcard pairs with flip animation
- Routes: `POST /api/notes/:id/summarize`, `/mcqs`, `/flashcards`

### Assignment AI
- **AI Prioritization** — Ranks pending assignments by urgency + weightage, generates an actionable plan via Gemini
- Route: `GET /api/assignments/ai-prioritization`

### AI Study Planner (Enhanced)
- Now semester-aware: only plans for subjects in the selected semester
- Ongoing subjects get a `1.5x` grade penalty (treated as in-progress, not failed)
- Handles empty-semester gracefully with helpful UI message
- Route supports `?semester=N` query param

### AI Chat Assistant (Enhanced)
- Premium message bubbles with gradient styling
- Animated typing indicator
- Quick-start prompt suggestions
- Keyboard shortcut (Enter to send)

---

## ✅ Semester-Wise Organization

### Backend Changes
- `Subject.js` model — Added `Ongoing` to grade enum; default changed from `C` → `Ongoing`
- `dashboardController.js` — Added `?semester` query filter; ongoing subjects excluded from GPA calc
- `analyticsController.js` — Ongoing excluded from GPA; grade distribution includes `Ongoing`
- `gpaController.js` — `Ongoing` grade shown in grade chart, properly excluded from CGPA formula
- `studyPlanController.js` — Semester query param filter
- `subjectService.js` / `gpaCalculator.js` — Ongoing maps to 0, safely skipped in calculations
- `subjectController.js` — Risk level calculated per subject (High/Medium/Low) from assignments

### Frontend Changes
- **Navbar** — Global semester selector (All / Semester 1–8), saved to `localStorage`, fires `semesterChange` event
- **Dashboard** — Subscribes to `semesterChange`, re-fetches with `?semester=N`
- **Subjects** — Filters displayed subjects by semester; shows Risk Level badge for ongoing subjects
- **AI Study Planner** — Semester-aware fetch
- **GPA** — Ongoing subjects show "In Progress" in grade column, excluded from per-semester GPA ring

---

## ✅ UI/UX Full Redesign

### Design System
- Premium SaaS aesthetic: indigo/violet gradient brand, soft card shadows, smooth micro-animations
- Sidebar: grouped navigation with SVG icons and gradient active state
- Navbar: global semester pill selector + clean avatar section

### Pages Redesigned
- **Dashboard** — GPA ring, AI Risk Panel, Area chart, Difficulty bar chart, AI Intelligence grid, Grade donut, Ongoing risk list
- **Subjects** — Risk badges (ongoing) vs grade badges (completed), semester-aware filtering
- **Assignments** — Status filter tabs, AI Prioritization panel, progress bar with dynamic color
- **Notes** — AI action buttons per card, interactive MCQ/flashcard UI
- **AI Study Planner** — Score cards, semester label, gradient study slot cards
- **AI Chat** — Gradient bubbles, typing indicator, starter prompts

---

## Bug Fixes Applied This Week
- Ongoing subjects no longer skew GPA to 0 (excluded from all GPA calculations)
- Risk level correctly shows "Low" when no pending assignments (not always "High" on GPA=0)
- Subjects now include `riskLevel` and `pendingAssignmentsCount` computed fields from assignments
- Dashboard insight text handles the case where all subjects are Ongoing (no grades yet)
- AI study planner fallback when no subjects exist in the selected semester

---

## Outcome — COMPLETED ✅

✔ AI Note Summarizer (Gemini)  
✔ AI MCQ Generator with interactive practice  
✔ AI Flashcard Generator with flip animation  
✔ AI Assignment Prioritizer with action plan  
✔ AI Study Planner (semester-scoped)  
✔ AI Chat Assistant (premium UI)  
✔ Global semester selector (Navbar → all pages)  
✔ Ongoing grade concept — no GPA impact, shows Risk Level instead  
✔ Per-subject risk levels (High/Medium/Low) from assignments  
✔ Full premium SaaS UI redesign across all pages  

Todo list

NEW CHANGES:
Consistency on UI
new advance features

deploy on render/netlify/ Railway
---

# 📈 FINAL PROJECT OUTCOME

After completion, EduTrack AI becomes:

✔ Full-stack MERN application  
✔ Academic management system (Subjects, Assignments, Timetable, Notes, GPA)  
✔ AI-powered academic assistant (Gemini integration)  
✔ Semester-wise intelligent data organization  
✔ Personal productivity platform  
✔ Portfolio-level software project  
✔ Scalable SaaS architecture  

---

# 🧠 ARCHITECTURE OVERVIEW

- Frontend: React (Vite, Component-based, Context API)
- Backend: Node + Express (MVC + Service layer)
- Database: MongoDB (NoSQL document structure)
- Auth: JWT + HTTP-only cookies
- State: React Context API + localStorage (semester preference, chat memory)
- Charts: Recharts (LineChart, AreaChart, BarChart, PieChart)
- AI: Google Gemini 1.5 Flash (study planning, summarization, MCQ, chat)

---

