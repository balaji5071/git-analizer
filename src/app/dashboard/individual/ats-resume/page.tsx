import { redirect } from "next/navigation";

import { AtsResumeBuilder } from "@/features/dashboard/components/ats-resume-builder";
import { requirePageSession } from "@/features/auth/server/session";

export default async function IndividualAtsResumePage() {
  const session = await requirePageSession(["individual"]);

  if (session.user.role !== "individual") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Resume Lab Beta
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Build an ATS resume from any job description (β).
        </h2>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          Paste a role description and generate a recruiter-friendly resume draft tailored to required keywords and responsibilities.
        </p>
        <p className="max-w-3xl rounded-2xl border border-amber-500/35 bg-amber-100/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
          Beta: This feature is currently in testing and is not fully developed yet.
        </p>
      </section>

      <AtsResumeBuilder />
    </div>
  );
}
