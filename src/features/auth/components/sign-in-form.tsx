"use client";

import { startTransition, useState } from "react";
import { Chrome, KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SignInForm({ showGoogle = false }: { showGoogle?: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleCredentialsSignIn() {
    setIsSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Access recruiter, individual, or admin workspace using JWT-backed sessions.
        </CardDescription>
      </CardHeader>
      <CardContent
        as="form"
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleCredentialsSignIn();
        }}
      >
        <div className="space-y-3">
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
            placeholder="Enter your password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
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
            leftIcon={<KeyRound className="h-4 w-4" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Continue with Email"}
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
