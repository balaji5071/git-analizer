import { ArrowRight, BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { AppLogo } from "@/components/common/app-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const audienceCards = [
  {
    title: "Recruiter Workspace",
    description:
      "Scan GitHub profiles, compare hireability scores, store history, and bookmark top candidates.",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Individual Coaching",
    description:
      "Evaluate your own profile, surface weak spots, and turn suggestions into a focused improvement plan.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Admin Oversight",
    description:
      "Monitor signups, analysis volume, user role distribution, and platform-wide scoring trends.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 backdrop-blur">
          <AppLogo />
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-medium text-slate-950 shadow-[0_14px_32px_rgba(34,197,94,0.25)] transition hover:bg-emerald-400"
            >
              Get Started
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
              AI-powered GitHub intelligence
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl">
                Turn public GitHub signals into hiring insight, coaching feedback, and admin analytics.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
                AI GitHub Profile Analyzer combines GitHub data, Groq-powered profile analysis,
                and role-based dashboards to help teams assess developers faster and help
                individuals improve with confidence.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-sm font-medium text-slate-950 shadow-[0_14px_32px_rgba(34,197,94,0.25)] transition hover:bg-emerald-400"
              >
                <ArrowRight className="h-4 w-4" />
                Launch Workspace
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
              >
                Explore Existing Account
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-sm text-[var(--muted)]">GitHub ingestion</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Repos, stars, languages
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-sm text-[var(--muted)]">AI output</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Strengths, risks, suggestions
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-sm text-[var(--muted)]">Access model</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Recruiter, individual, admin
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {audienceCards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    {card.icon}
                  </div>
                  <CardTitle className="pt-3">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-px bg-[var(--border)]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
