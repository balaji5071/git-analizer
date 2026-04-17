import type { ReactNode } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { requirePageSession } from "@/features/auth/server/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requirePageSession();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.user.role} email={session.user.email} />
      <div className="min-w-0 flex-1">
        <Navbar name={session.user.name} email={session.user.email} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
