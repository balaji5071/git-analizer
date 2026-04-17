"use client";

import { Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/format";

type SettingsProfile = {
  name: string;
  email: string;
  phone: string;
  country: string;
  resumeFileName: string;
  resumeUpdatedAt: string | null;
};

const DEFAULT_PROFILE: SettingsProfile = {
  name: "",
  email: "",
  phone: "",
  country: "",
  resumeFileName: "",
  resumeUpdatedAt: null,
};

export function SettingsForm() {
  const [profile, setProfile] = useState<SettingsProfile>(DEFAULT_PROFILE);
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch("/api/settings/profile", { method: "GET" });
      const payload = (await response.json()) as {
        error?: string;
        profile?: SettingsProfile;
      };

      if (!response.ok || !payload.profile) {
        setError(payload.error ?? "Unable to load settings.");
        setIsInitialLoading(false);
        return;
      }

      setProfile(payload.profile);
      setIsInitialLoading(false);
    }

    loadProfile();
  }, []);

  async function saveSettings() {
    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("phone", profile.phone);
    formData.append("country", profile.country);
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("resumeText", resumeText);

    if (resumeFile) {
      formData.append("resumeFile", resumeFile);
    }

    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      body: formData,
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      profile?: SettingsProfile;
    };

    setIsLoading(false);

    if (!response.ok || !payload.profile) {
      setError(payload.error ?? "Unable to update settings.");
      return;
    }

    setProfile(payload.profile);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResumeText("");
    setResumeFile(null);
    setMessage(payload.message ?? "Settings updated successfully.");
  }

  if (isInitialLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-[var(--muted)]">Loading settings...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic profile</CardTitle>
          <CardDescription>
            Update your account identity and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Full name</p>
            <Input
              value={profile.name}
              onChange={(event) =>
                setProfile((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Email</p>
            <Input
              type="email"
              value={profile.email}
              onChange={(event) =>
                setProfile((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Phone</p>
            <Input
              value={profile.phone}
              onChange={(event) =>
                setProfile((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Country</p>
            <Input
              value={profile.country}
              onChange={(event) =>
                setProfile((current) => ({ ...current, country: event.target.value }))
              }
              placeholder="India"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your password. If email or password changes, re-login may be required.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Current password</p>
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Required for email/password change"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">New password</p>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Confirm password</p>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Retype new password"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
          <CardDescription>
            Upload PDF/DOCX/TXT resume or paste resume text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Upload resume</p>
            <input
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-500/15 file:px-3 file:py-2 file:text-xs file:font-medium file:text-emerald-300"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Or paste resume text</p>
            <textarea
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste resume text here..."
              className="min-h-40 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-emerald-400 transition focus:ring-2"
            />
          </div>

          <p className="text-sm text-[var(--muted)]">
            Latest resume: {profile.resumeFileName || "Not uploaded"}
            {profile.resumeUpdatedAt ? ` (updated ${formatDate(profile.resumeUpdatedAt)})` : ""}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={saveSettings} disabled={isLoading} leftIcon={<Save className="h-4 w-4" />}>
          {isLoading ? "Saving..." : "Save settings"}
        </Button>
        {resumeFile ? (
          <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
            <Upload className="h-3.5 w-3.5" />
            {resumeFile.name}
          </span>
        ) : null}
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
