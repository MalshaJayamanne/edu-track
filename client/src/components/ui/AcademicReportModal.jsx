import React, { useRef, useState } from "react";
import { HiOutlinePrinter, HiOutlineX, HiOutlineDownload, HiOutlineAcademicCap, HiOutlineCheckCircle } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { showToast } from "../../utils/toast";

export function AcademicReportModal({ isOpen, onClose, gpaData, subjects = [], assignments = [] }) {
  const { user } = useAuth();
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const origMaxHeight = element.style.maxHeight;
    const origOverflow = element.style.overflow;
    const origHeight = element.style.height;

    try {
      setDownloading(true);
      showToast.info("Preparing PDF transcript...");

      // Temporarily expand element so html2canvas renders ALL content without clipping
      element.style.maxHeight = "none";
      element.style.overflow = "visible";
      element.style.height = "auto";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210; // 210mm standard portrait width
      const pdfHeight = Math.max((canvas.height * pdfWidth) / canvas.width, 297); // Dynamic continuous height

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      // Render full document on a single continuous sheet
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const fileName = `EduTrack_Academic_Report_${user?.name?.replace(/\s+/g, "_") || "Student"}.pdf`;
      pdf.save(fileName);
      showToast.success("PDF Downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast.error("Failed to generate PDF. You can use Print as alternative.");
    } finally {
      // Restore original container styles
      if (element) {
        element.style.maxHeight = origMaxHeight;
        element.style.overflow = origOverflow;
        element.style.height = origHeight;
      }
      setDownloading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cgpa = Number(gpaData?.cgpa ?? 0).toFixed(2);
  const totalCredits = gpaData?.totalCredits ?? subjects.reduce((sum, s) => sum + Number(s.credits || 0), 0);
  const totalSubjects = subjects.length;
  const completedAssignments = assignments.filter((a) => a.status === "Completed").length;

  const getAcademicStanding = (val) => {
    const num = Number(val);
    if (num >= 3.7) return "First Class / Distinction 🏆";
    if (num >= 3.0) return "Second Class Upper / Merit 🎯";
    if (num >= 2.0) return "Pass ✅";
    return "Under Review / At Risk ⚠️";
  };

  // Group subjects by semester
  const semesterMap = {};
  subjects.forEach((sub) => {
    const semKey = sub.semester || 1;
    if (!semesterMap[semKey]) semesterMap[semKey] = [];
    semesterMap[semKey].push(sub);
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        
        {/* Action Header (Hidden in Print) */}
        <div className="print:hidden px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <HiOutlineAcademicCap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">Academic Report & Transcript</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Download direct PDF file or use print engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition-all disabled:opacity-60 touch-action-manipulation cursor-pointer"
            >
              {downloading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiOutlineDownload className="w-4 h-4" />
              )}
              <span>{downloading ? "Generating..." : "Download PDF"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all touch-action-manipulation cursor-pointer"
            >
              <HiOutlinePrinter className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Transcript Document */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 printable-document" ref={printRef}>
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <img src="/logo.png" className="w-8 h-8 object-contain rounded-lg" alt="EduTrack AI Logo" />
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">EduTrack AI</h1>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Official Student Performance Record</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Date Issued:</span> {currentDate}</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Document ID:</span> ET-TR-{Math.floor(100000 + Math.random() * 900000)}</p>
            </div>
          </div>

          {/* Student & Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Student Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Profile</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-slate-500 font-medium">Name:</span> <strong className="text-slate-800 dark:text-slate-100">{user?.name || "Student"}</strong></p>
                <p><span className="text-slate-500 font-medium">Email:</span> <span className="text-slate-700 dark:text-slate-300">{user?.email || "N/A"}</span></p>
                <p><span className="text-slate-500 font-medium">Academic Status:</span> <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getAcademicStanding(cgpa)}</span></p>
              </div>
            </div>

            {/* Performance Snapshot */}
            <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/60">
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Academic Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-indigo-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Cumulative GPA</p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{cgpa} / 4.00</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-indigo-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Total Credits</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalCredits}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Modules / Semester Breakdown */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-indigo-600" />
              <span>Enrolled Subjects & Course Grades</span>
            </h2>

            {Object.keys(semesterMap).length === 0 ? (
              <p className="text-sm text-slate-400 italic">No subject data recorded.</p>
            ) : (
              Object.keys(semesterMap).sort((a, b) => Number(a) - Number(b)).map((sem) => (
                <div key={sem} className="mb-6">
                  <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Semester {sem}</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="p-3">Code</th>
                          <th className="p-3">Subject Title</th>
                          <th className="p-3">Lecturer</th>
                          <th className="p-3 text-center">Credits</th>
                          <th className="p-3 text-center">Difficulty</th>
                          <th className="p-3 text-center">Grade</th>
                          <th className="p-3 text-center">Grade Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                        {semesterMap[sem].map((sub) => (
                          <tr key={sub._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{sub.code || "—"}</td>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{sub.title}</td>
                            <td className="p-3 text-slate-500">{sub.lecturer || "Unassigned"}</td>
                            <td className="p-3 text-center font-medium">{sub.credits}</td>
                            <td className="p-3 text-center">{sub.difficulty}</td>
                            <td className="p-3 text-center font-bold">
                              {sub.grade === "Ongoing" ? (
                                <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">Ongoing</span>
                              ) : (
                                sub.grade || "—"
                              )}
                            </td>
                            <td className="p-3 text-center font-semibold">{sub.grade === "Ongoing" ? "—" : (sub.gradePoint ?? 0).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Transcript Footer & Verification */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
            <p>Generated via EduTrack AI Academic Management Platform</p>
            <p className="font-mono">Verification Hash: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AcademicReportModal;
