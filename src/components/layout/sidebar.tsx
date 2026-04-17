"use client";

import {
  Bookmark,
  Clock3,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/common/app-logo";
import { cn } from "@/utils/cn";
import type { UserRole } from "@/types/auth";

type SidebarNavItem = {
  href: Route;
  label: string;
  icon: typeof LayoutDashboard;
  match: "exact" | "startsWith";
};

const navigationByRole: Record<
  UserRole,
  SidebarNavItem[]
> = {
  recruiter: [
    {
      href: "/dashboard/recruiter",
      label: "Recruiter Hub",
      icon: LayoutDashboard,
      match: "startsWith",
    },
    {
      href: "/dashboard/recruiter/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      match: "startsWith",
    },
    { href: "/dashboard/history", label: "History", icon: Clock3, match: "startsWith" },
  ],
  individual: [
    {
      href: "/dashboard/individual",
      label: "My Profile",
      icon: UserRound,
      match: "startsWith",
    },
    {
      href: "/dashboard/individual/ats-resume",
      label: "ATS Resume β",
      icon: FileText,
      match: "startsWith",
    },
    { href: "/dashboard/history", label: "History", icon: Clock3, match: "startsWith" },
  ],
  admin: [
    {
      href: "/dashboard/admin",
      label: "Admin Overview",
      icon: ShieldCheck,
      match: "startsWith",
    },
    { href: "/dashboard/history", label: "History", icon: Clock3, match: "startsWith" },
  ],
};

export function Sidebar({
  role,
  email,
  isOpen,
  onClose,
  onNavigate,
}: {
  role: UserRole;
  email?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navigationByRole[role];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-screen w-80 shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)]/95 px-6 py-8 backdrop-blur transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)] xl:hidden"
      >
        <X className="h-4 w-4" />
      </button>

      <AppLogo />

      <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Signed in as
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{role}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{email}</p>
      </div>

      <nav className="mt-8 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.match === "startsWith"
              ? pathname.startsWith(item.href)
              : pathname === item.href;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-emerald-500/12 text-emerald-400"
                  : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
        >
          <Settings className="h-4 w-4 text-[var(--muted)]" />
          Settings
        </Link>

        <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-emerald-500/12 to-transparent p-5">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Hiring-quality profile intelligence
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Cache GitHub signals, compare analysis history, and keep role-specific views clean.
          </p>
        </div>
      </div>
    </aside>
  );
}
