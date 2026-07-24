import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Settings() {
  const { user, logout, updateProfile } = useAuth();

  // ── Profile ──
  const [name, setName] = useState(user?.name || "");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  // ── Theme ──
  const [theme, setTheme] = useState(() => user?.theme || localStorage.getItem("appTheme") || "light");
  const [savingTheme, setSavingTheme] = useState(false);

  // ── Password ──
  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // ── Notifications ──
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem("assignmentReminders");
    return saved === null ? true : saved === "true";
  });

  // ── AI Credits ──
  const [resettingCredits, setResettingCredits] = useState(false);

  // ── Logout ──
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Feedback ──
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const showSuccess = (msg) => {
    setSuccessMsg(msg); setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };
  const showError = (msg) => {
    setErrorMsg(msg); setSuccessMsg("");
    setTimeout(() => setErrorMsg(""), 4000);
  };

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.theme) setTheme(user.theme);
  }, [user]);

  // ── Handlers ──
  const handleNameSave = async () => {
    if (!name.trim()) return;
    try {
      setSavingName(true);
      await updateProfile({ name: name.trim() });
      setEditingName(false);
      showSuccess("Name updated successfully!");
    } catch {
      showError("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("appTheme", newTheme);
    // Apply immediately
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try {
      setSavingTheme(true);
      await updateProfile({ theme: newTheme });
      showSuccess(`Theme switched to ${newTheme === "dark" ? "Dark Mode" : "Light Mode"}!`);
    } catch {
      showError("Failed to sync theme.");
    } finally {
      setSavingTheme(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showError("Please fill in all password fields.");
      return;
    }
    if (newPw !== confirmPw) {
      showError("New passwords do not match.");
      return;
    }
    if (newPw.length < 6) {
      showError("New password must be at least 6 characters.");
      return;
    }
    try {
      setSavingPw(true);
      await API.put("/auth/change-password", { currentPassword: currentPw, newPassword: newPw });
      showSuccess("Password changed successfully!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setShowPwSection(false);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSavingPw(false);
    }
  };

  const handleResetCredits = async () => {
    try {
      setResettingCredits(true);
      await updateProfile({ aiCredits: 20 });
      showSuccess("AI credits topped up to 20!");
    } catch {
      showError("Failed to reset AI credits.");
    } finally {
      setResettingCredits(false);
    }
  };

  const handleNotifsToggle = () => {
    setNotifs((v) => {
      const next = !v;
      localStorage.setItem("assignmentReminders", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    if (!confirmingLogout) { setConfirmingLogout(true); return; }
    try {
      setLoggingOut(true);
      await logout();
    } catch {
      setLoggingOut(false);
      setConfirmingLogout(false);
    }
  };

  const aiCredits = user?.aiCredits !== undefined ? user.aiCredits : 20;
  const creditsPercent = (aiCredits / 20) * 100;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Toast messages */}
      {successMsg && (
        <div className="max-w-2xl mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="max-w-2xl mb-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      <div className="max-w-2xl space-y-6">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-5">Account</h2>

          {/* Avatar row */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100/60">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-200 shrink-0">
              {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "ST"}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg leading-tight">{user?.name || "Student"}</p>
              <p className="text-sm text-slate-500">{user?.email || "—"}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Full name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-t border-slate-50 gap-2">
              <div className="flex-1 mr-4">
                <p className="text-sm font-semibold text-slate-700">Full Name</p>
                <p className="text-xs text-slate-400 mt-0.5">Your display name across the platform</p>
                {editingName && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none flex-1 min-w-0"
                      disabled={savingName}
                      placeholder="Enter your name"
                    />
                    <button
                      onClick={handleNameSave}
                      disabled={savingName || !name.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {savingName ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setName(user?.name || ""); }}
                      disabled={savingName}
                      className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              {!editingName && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{user?.name || "—"}</span>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex justify-between items-center py-3 border-t border-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-700">Email</p>
                <p className="text-xs text-slate-400 mt-0.5">Linked to your account</p>
              </div>
              <span className="text-sm text-slate-500 font-mono">{user?.email || "—"}</span>
            </div>

            {/* Change password */}
            <div className="py-3 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Password</p>
                  <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
                </div>
                <button
                  onClick={() => setShowPwSection((v) => !v)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  {showPwSection ? "Cancel" : "Change"}
                </button>
              </div>

              {showPwSection && (
                <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {/* Current password */}
                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Current Password</label>
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none pr-10"
                      placeholder="Enter current password"
                      disabled={savingPw}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(v => !v)}
                      className="absolute right-3 top-[30px] text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* New password */}
                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">New Password</label>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none pr-10"
                      placeholder="Min. 6 characters"
                      disabled={savingPw}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-[30px] text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordChange()}
                      className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 outline-none ${
                        confirmPw && newPw !== confirmPw
                          ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
                      }`}
                      placeholder="Re-enter new password"
                      disabled={savingPw}
                    />
                    {confirmPw && newPw !== confirmPw && (
                      <p className="text-xs text-rose-500 mt-1">Passwords don't match</p>
                    )}
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={savingPw || !currentPw || !newPw || !confirmPw || newPw !== confirmPw}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
                  >
                    {savingPw ? "Updating password…" : "Update Password"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── AI Credits Card ── */}
        <div className={`bg-white rounded-2xl border shadow-sm p-6 ${aiCredits === 0 ? "border-rose-200" : "border-slate-100"}`}>
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-5">AI Usage Quota</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-700">AI Credits Remaining</p>
                <p className="text-xs text-slate-400 mt-0.5">Used for chat, summarization, MCQ & flashcard generation</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className={`text-xl font-black px-4 py-1.5 rounded-xl border ${
                  aiCredits === 0
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : aiCredits <= 5
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }`}>
                  {aiCredits}
                  <span className="text-sm font-semibold opacity-60"> / 20</span>
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  aiCredits === 0 ? "bg-rose-400" : aiCredits <= 5 ? "bg-amber-400" : "bg-emerald-500"
                }`}
                style={{ width: `${creditsPercent}%` }}
              />
            </div>

            {aiCredits === 0 && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-700 font-medium">
                🚫 AI features are currently disabled. Refill your credits to continue using AI tools.
              </div>
            )}
            {aiCredits > 0 && aiCredits <= 5 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 font-medium">
                ⚠️ Running low on credits. Consider refilling soon.
              </div>
            )}

            <button
              onClick={handleResetCredits}
              disabled={resettingCredits}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-indigo-100 disabled:opacity-50"
            >
              {resettingCredits ? "Refilling…" : "⚡ Refill to 20 Credits"}
            </button>
          </div>
        </div>

        {/* ── Preferences ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-5">Preferences</h2>

          <div className="space-y-4">
            {/* Dark mode toggle */}
            <div className="flex justify-between items-center py-3 border-t border-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-700">Dark Mode</p>
                <p className="text-xs text-slate-400 mt-0.5">Switch to dark interface theme</p>
              </div>
              <button
                onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
                disabled={savingTheme}
                role="switch"
                aria-checked={theme === "dark"}
                className={`relative inline-flex shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  theme === "dark" ? "bg-indigo-600" : "bg-slate-200"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-0.5 left-0.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out text-[10px] ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {theme === "dark" ? "🌙" : "☀️"}
                </span>
              </button>
            </div>

            {/* Assignment reminders */}
            <div className="flex justify-between items-center py-3 border-t border-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-700">Assignment Reminders</p>
                <p className="text-xs text-slate-400 mt-0.5">Get notified before deadlines in the notification bell</p>
              </div>
              <button
                onClick={handleNotifsToggle}
                role="switch"
                aria-checked={notifs}
                className={`relative inline-flex shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  notifs ? "bg-indigo-600" : "bg-slate-200"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-0.5 left-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                    notifs ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── Account Actions ── */}
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
          <h2 className="font-bold text-rose-500 text-sm uppercase tracking-wider mb-5">Account Actions</h2>

          <div className="flex items-center justify-between py-3 border-t border-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-700">Sign Out</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {confirmingLogout ? "Click confirm to sign out of your session" : "Log out of your current session"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {confirmingLogout && (
                <button
                  onClick={() => setConfirmingLogout(false)}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50 ${
                  confirmingLogout
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200"
                    : "text-rose-600 bg-rose-50 hover:bg-rose-100"
                }`}
              >
                {loggingOut ? "Signing out…" : confirmingLogout ? "Confirm Sign Out" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
