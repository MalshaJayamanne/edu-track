import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PageWrapper from "../ui/PageWrapper";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: sidebar is an overlay, default closed
  const [mobileOpen, setMobileOpen] = useState(false);

  // On desktop, collapsed = icon-only sidebar. On mobile, collapsed is irrelevant (overlay).
  const isMobile = () => window.innerWidth < 768;

  const handleToggle = () => {
    if (isMobile()) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar drawer */}
          <div className="fixed left-0 top-0 h-full z-50 md:hidden">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          collapsed={collapsed}
          onToggleSidebar={handleToggle}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <PageWrapper>
            {children}
          </PageWrapper>
        </main>
      </div>
    </div>
  );
}