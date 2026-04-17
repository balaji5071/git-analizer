"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import type { UserRole } from "@/types/auth";

export function DashboardShell({
  role,
  email,
  name,
  children,
}: {
  role: UserRole;
  email?: string | null;
  name?: string | null;
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleNavigate = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 xl:hidden"
        />
      ) : null}

      <Sidebar
        role={role}
        email={email}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      <div className={`min-w-0 transition-[margin] duration-300 ${isSidebarOpen ? "xl:ml-80" : "xl:ml-0"}`}>
        <Navbar
          name={name}
          email={email}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
