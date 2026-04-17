"use client";

import {
  House,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/common/app-logo";
import { cn } from "@/utils/cn";
import type { UserRole } from "@/types/auth";

const navigationByRole: Record<
  UserRole,
  Array<{ href: Route; label: string; icon: typeof LayoutDashboard }>
> = {
  recruiter: [
    { href: "/dashboard/recruiter", label: "Recruiter Hub", icon: LayoutDashboard },
    { href: "/", label: "Home", icon: House },
  ],
  individual: [
    { href: "/dashboard/individual", label: "My Profile", icon: UserRound },
    { href: "/", label: "Home", icon: House },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Admin Overview", icon: ShieldCheck },
    { href: "/", label: "Home", icon: House },
  ],
};

export function Sidebar({
  role,
  email,
}: {
  role: UserRole;
  email?: string | null;
}) {
  const pathname = usePathname();
  const items = navigationByRole[role];

  return (
    <aside className="hidden w-80 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/90 px-6 py-8 backdrop-blur xl:flex xl:flex-col">
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
          const isActive = pathname === item.href;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
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

      <div className="mt-auto rounded-3xl border border-[var(--border)] bg-gradient-to-br from-emerald-500/12 to-transparent p-5">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Hiring-quality profile intelligence
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Cache GitHub signals, compare analysis history, and keep role-specific views clean.
        </p>
      </div>
    </aside>
  );
}
