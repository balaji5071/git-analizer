"use client";

import { startTransition, useState } from "react";
import { Chrome, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/types/auth";
import { cn } from "@/utils/cn";
import {
  isValidGitHubUsername,
  normalizeGitHubUsernameInput,
} from "@/utils/github";

const selectableRoles: Array<{
  value: Extract<UserRole, "recruiter" | "individual">;
  title: string;
  description: string;
}> = [
  {
    value: "individual",
    title: "Individual",
    description: "Analyze your own profile and track improvement suggestions privately.",
  },
  {
    value: "recruiter",
    title: "Recruiter",
    description: "Search candidates, save history, and bookmark promising developers.",
  },
];

export function SignUpForm({ showGoogle = false }: { showGoogle?: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "individual" as Extract<UserRole, "recruiter" | "individual">,
    githubUsername: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const normalizedGitHubUsername = normalizeGitHubUsernameInput(form.githubUsername);

    if (form.role === "individual" && !normalizedGitHubUsername) {
      setIsSubmitting(false);
      setError("GitHub username is required for individual accounts.");
      return;
    }

    if (normalizedGitHubUsername && !isValidGitHubUsername(normalizedGitHubUsername)) {
      setIsSubmitting(false);
      setError("Enter a valid GitHub username.");
      return;
    }

    const requestPayload = {
      ...form,
      githubUsername: normalizedGitHubUsername,
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const responsePayload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setIsSubmitting(false);
      setError(responsePayload.error ?? "Unable to create your account.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (signInResult?.error) {
      setError("Your account was created, but automatic sign-in failed.");
      return;
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create your workspace</CardTitle>
        <CardDescription>
          Choose a role now. Admin access is controlled through environment-backed allowlisting.
        </CardDescription>
      </CardHeader>
      <CardContent
        as="form"
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {selectableRoles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setForm((current) => ({ ...current, role: role.value }))}
              className={cn(
                "rounded-3xl border p-4 text-left transition",
                form.role === role.value
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-[var(--border)] bg-[var(--surface-strong)] hover:bg-[var(--surface-hover)]",
              )}
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{role.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {role.description}
              </p>
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
          <Input
            type="email"
            placeholder="name@company.com"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <Input
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          <Input
            placeholder={
              form.role === "individual"
                ? "GitHub username (required)"
                : "GitHub username (optional)"
            }
            value={form.githubUsername}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                githubUsername: event.target.value,
              }))
            }
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full"
            leftIcon={<UserPlus className="h-4 w-4" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
          {showGoogle ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              leftIcon={<Chrome className="h-4 w-4" />}
              onClick={async () => {
                setIsGoogleLoading(true);
                await signIn("google", { callbackUrl: "/dashboard" });
                setIsGoogleLoading(false);
              }}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
