import Link from "next/link";

import { AppLogo } from "@/components/common/app-logo";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function SignInPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 backdrop-blur">
          <AppLogo />
          <div className="mt-14 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              Review developer signals with sharper context.
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--muted)]">
              Sign in to access cached GitHub profile snapshots, AI-generated findings, and
              role-aware workflows for recruiters, individuals, and admins.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full space-y-5">
            <SignInForm showGoogle={googleEnabled} />
            <p className="text-center text-sm text-[var(--muted)]">
              Need an account?{" "}
              <Link href="/sign-up" className="font-semibold text-emerald-400">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
