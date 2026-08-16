import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Subjects from "./pages/Subjects";
import Analytics from "./pages/Analytics";
import Assignments from "./pages/Assignments";
import Timetable from "./pages/Timetable";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import GPA from "./pages/GPA";
import ProductivityDashboard from "./pages/ProductivityDashboard";
import AIChat from "./pages/AIChat";
import AIStudyPlanner from "./pages/AIStudyPlanner";

function App() {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;

  useEffect(() => {
    const savedTheme = user?.theme || localStorage.getItem("appTheme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [user?.theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: {
            maxWidth: '90vw'
          }
        }} 
      />
      <Routes>

        {/* PUBLIC HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute user={user}>
              <Subjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments"
          element={
            <ProtectedRoute user={user}>
              <Assignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/timetable"
          element={
            <ProtectedRoute user={user}>
              <Timetable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute user={user}>
              <Notes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute user={user}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gpa"
          element={
            <ProtectedRoute user={user}>
              <GPA />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/productivity" 
          element={
            <ProtectedRoute user={user}>
              <ProductivityDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ai-chat" 
          element={
            <ProtectedRoute user={user}>
              <AIChat />
            </ProtectedRoute>
          }
        />  
        <Route 
          path="/ai-study-plan" 
          element={
            <ProtectedRoute user={user}>
              <AIStudyPlanner />
            </ProtectedRoute>
          }
        />


        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;