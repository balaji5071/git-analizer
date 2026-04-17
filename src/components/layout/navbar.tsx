"use client";

import { LogOut, PanelLeftOpen } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";

function getTitle(pathname: string) {
  if (pathname.startsWith("/dashboard/admin")) {
    return "Admin Dashboard";
  }

  if (pathname.startsWith("/dashboard/recruiter")) {
    return "Recruiter Dashboard";
  }

  if (pathname.startsWith("/dashboard/individual")) {
    return "Individual Dashboard";
  }

  return "Dashboard";
}

export function Navbar({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 xl:hidden">
            <PanelLeftOpen className="h-4 w-4 text-[var(--muted)]" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
              Workspace
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {getTitle(pathname)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[var(--foreground)]">{name || "Team member"}</p>
            <p className="text-xs text-[var(--muted)]">{email}</p>
          </div>
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
