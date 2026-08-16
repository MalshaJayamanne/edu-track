import React from "react";
import { 
  HiOutlineAcademicCap, 
  HiOutlineDocumentText, 
  HiOutlineClipboardList, 
  HiOutlineCalendar, 
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiPlus
} from "react-icons/hi";

const ICON_MAP = {
  subjects: HiOutlineAcademicCap,
  notes: HiOutlineDocumentText,
  assignments: HiOutlineClipboardList,
  timetable: HiOutlineCalendar,
  ai: HiOutlineSparkles,
  analytics: HiOutlineChartBar
};

export function EmptyState({
  type = "assignments",
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  icon: CustomIcon
}) {
  const IconComponent = CustomIcon || ICON_MAP[type] || HiOutlineClipboardList;

  const defaultTitles = {
    subjects: "No subjects found",
    notes: "No notes added yet",
    assignments: "No assignments listed",
    timetable: "Schedule is clear",
    ai: "No AI insights generated yet",
    analytics: "No academic data recorded"
  };

  const defaultDescriptions = {
    subjects: "Start by adding your enrolled modules for this semester.",
    notes: "Capture your lecture highlights, code snippets, or key concepts.",
    assignments: "Track project deadlines, quizzes, and homework effortlessy.",
    timetable: "Map your weekly lectures, lab sessions, and study hours.",
    ai: "Generate instant study plans or summarize notes using Gemini AI.",
    analytics: "Add subjects with grades to unlock CGPA ring statistics & trend graphs."
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-600/60 ${className}`}>
      {/* Icon Badge with Glow */}
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
          <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 transform transition-transform hover:scale-110 duration-200" />
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        {title || defaultTitles[type]}
      </h3>
      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description || defaultDescriptions[type]}
      </p>

      {/* Action CTA Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all touch-action-manipulation"
        >
          <HiPlus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
