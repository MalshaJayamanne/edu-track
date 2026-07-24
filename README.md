# 🎓 EduTrack AI

> Intelligent Personal Student Academic Management System (MERN Stack + Gemini AI)

EduTrack AI is a full-stack academic productivity platform designed for university students to manage modules, dynamically track GPA performance, organize study plans, track assignments, and supercharge learning using Google Gemini AI assistance.

---

## Key Modules & Features

### 📊 Dynamic Dashboard & Analytics
- **Live GPA Tracker**: Real-time Semester GPA and Cumulative CGPA calculations with target threshold progress.
- **Dynamic KPI Tracker**: Total earned credits, active enrolled subjects, pending assignments, and AI credit balances.
- **Visual Analytics**: Interactive Grade Distribution pie charts and difficulty density breakdown powered by Recharts.
- **Academic Intelligence**: Auto-generated insights highlighting hardest modules and priority focus areas.

### 📖 Subject & Grade Manager
- Full CRUD operations for course modules with credit values, semester tags, and instructor details.
- Color tags and difficulty classification (Easy, Moderate, Hard, Very Hard).
- Flexible grade management supporting standard letter grades (A+, A, A-, B+, B, B-, C+, C, F) or "Ongoing" status.

### 📝 Smart Assignment Tracker
- Interactive progress sliders (0–100%) dynamically shifting statuses (Pending, In Progress, Completed).
- Smart deadline indicators ("X days left", "Due Today", "Overdue").
- **AI Task Prioritization**: Gemini-powered intelligent task sorting based on urgency, weighting, and estimated workload.

### 📅 Timetable & Schedule System
- Weekly timetable grid (Monday–Sunday) dynamically sorted by start time.
- Color-coded session cards (Lecture, Lab, Study, Exam).
- Mobile-optimized touch-friendly session management.

### 📚 Digital Notes & AI Study Hub
- CRUD notes with subject bindings, custom tags (Lecture, Lab, Assignment, Exam), and pin-to-top feature.
- **AI Study Tools**:
  - **AI Summary**: Condenses long notes into structured key revision takeaways.
  - **AI MCQ Generator**: Generates 3 practice quiz questions with instant answer reveals.
  - **AI Flashcards**: Compiles flashcard revision sets with dynamic card-flip animations.

### 🤖 AI Study Assistant & Chat
- Conversational study assistant powered by Google Gemini Flash.
- Session-based conversation persistence (`sessionStorage`) keeping chat state seamless across tab reloads.
- Responsive overlay slide-over chat interface with theme-aware styling.
- AI Credit exhaustion protection to guide users gracefully when API limits are reached.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios, React Router v6.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM), ES Modules.
- **AI Integration**: Google Gemini 1.5 Flash API (`@google/generative-ai`).
- **Authentication**: Secure JWT stored in HTTP-Only Cookies.

---

## 📁 Project Structure

```text
edu-track-ai/
├── client/                 # React Frontend (Vite + Tailwind CSS)
│   ├── public/             # Static public assets
│   └── src/
│       ├── components/     # UI, Layout, Charts, Modals, Chat components
│       ├── context/        # Auth and global state contexts
│       ├── hooks/          # Custom hooks (e.g. useWindowSize)
│       ├── pages/          # Dashboard, Subjects, Assignments, Timetable, Notes, Settings
│       ├── services/       # Axios API client setup
│       └── utils/          # Helper utilities and grade calculations
├── server/                 # Node.js + Express Backend
│   └── src/
│       ├── config/         # Database connection configuration
│       ├── controllers/    # Route handler logic
│       ├── middleware/     # Auth, error handling, validation middleware
│       ├── models/         # Mongoose schemas (User, Subject, Assignment, Note, Session)
│       ├── routes/         # Express API endpoints
│       └── utils/          # AI context builders, token helpers
├── docs/                   # System documentation & development timeline
└── README.md
```

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or later
- **MongoDB**: Local instance or MongoDB Atlas URI
- **API Key**: Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `server/`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 📱 Mobile & Responsive UI Optimization

The application is built with a mobile-first responsive architecture featuring:
- Viewport overflow protection (`overflow-x-hidden`) preventing unwanted horizontal scrolling.
- iOS safe-area inset padding for seamless mobile browser navigation.
- Touch-friendly minimum target sizes (>= 38px) across buttons and inputs.
- Responsive mobile drawer menus and dynamic slide-over panels.
- Dark and Light mode consistency across all UI components.
