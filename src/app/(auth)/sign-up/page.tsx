import Link from "next/link";

import { AppLogo } from "@/components/common/app-logo";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function SignUpPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 backdrop-blur">
          <AppLogo />
          <div className="mt-14 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
              Build your workspace
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              Start with a role, then let the platform shape the experience around it.
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--muted)]">
              Recruiters get candidate search and bookmarks. Individuals get profile coaching.
              Admins are controlled through environment-backed allowlisting for safer production
              access.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full space-y-5">
            <SignUpForm showGoogle={googleEnabled} />
            <p className="text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-emerald-400">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
