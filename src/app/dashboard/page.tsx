import { redirect } from "next/navigation";

import { requirePageSession } from "@/features/auth/server/session";

export default async function DashboardRedirectPage() {
  const session = await requirePageSession();

  if (session.user.role === "admin") {
    redirect("/dashboard/admin");
  }

  if (session.user.role === "recruiter") {
    redirect("/dashboard/recruiter");
  }

  redirect("/dashboard/individual");
}
