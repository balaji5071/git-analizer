"use client";

import { Download, WandSparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AtsResumeResult } from "@/types/resume";

function downloadResumeFile(content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "ats-resume.txt";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function AtsResumeBuilder() {
  const [existingResume, setExistingResume] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<AtsResumeResult | null>(null);

  async function handleGenerate() {
    if (!resumeFile && existingResume.trim().length < 120) {
      setError("Please paste your current resume content or upload a PDF/DOCX file.");
      return;
    }

    if (jobDescription.trim().length < 80) {
      setError("Please paste a detailed job description (minimum 80 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("existingResume", existingResume);

    if (resumeFile) {
      formData.append("resumeFile", resumeFile);
    }

    const response = await fetch("/api/resume/build", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      error?: string;
      resume?: AtsResumeResult;
    };

    setIsLoading(false);

    if (!response.ok || !payload.resume) {
      setError(payload.error ?? "Unable to generate ATS resume.");
      return;
    }

    setResume(payload.resume);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ATS Resume Builder</CardTitle>
          <CardDescription>
            Upload your current resume (PDF/DOCX) or paste resume text, then add a job description to generate an ATS-optimized draft.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="resume-file">
            Upload resume (PDF or DOCX)
          </label>
          <input
            id="resume-file"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-500/15 file:px-3 file:py-2 file:text-xs file:font-medium file:text-emerald-300"
          />

          <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="existing-resume">
            Current resume (text fallback)
          </label>
          <textarea
            id="existing-resume"
            value={existingResume}
            onChange={(event) => setExistingResume(event.target.value)}
            placeholder="Optional if you uploaded a file. Paste your existing resume content here..."
            className="min-h-56 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-emerald-400 transition focus:ring-2"
          />

          <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="job-description">
            Job description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-56 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-emerald-400 transition focus:ring-2"
          />

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

          <Button
            type="button"
            leftIcon={<WandSparkles className="h-4 w-4" />}
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? "Building Resume..." : "Build ATS Resume"}
          </Button>
        </CardContent>
      </Card>

      {resume ? (
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{resume.title}</CardTitle>
              <CardDescription>Download or copy this draft and customize further before applying.</CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => downloadResumeFile(resume.plainTextResume)}
            >
              Download Resume
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Professional summary</p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{resume.professionalSummary}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Core skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {resume.coreSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Impact highlights</p>
              <ul className="mt-2 space-y-2">
                {resume.impactBullets.map((bullet) => (
                  <li key={bullet} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-[var(--muted)]">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Project highlights</p>
              <ul className="mt-2 space-y-2">
                {resume.projectHighlights.map((project) => (
                  <li key={project} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-[var(--muted)]">
                    {project}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">ATS keywords</p>
              <p className="mt-2 rounded-2xl bg-white/5 px-4 py-3 text-sm leading-7 text-[var(--muted)]">
                {resume.atsKeywords.join(", ")}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Mistakes found in old resume</p>
              <ul className="mt-2 space-y-2">
                {resume.detectedMistakes.map((item) => (
                  <li key={item} className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">What we changed</p>
              <ul className="mt-2 space-y-2">
                {resume.changesMade.map((item) => (
                  <li key={item} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Remaining gaps for this job</p>
              <ul className="mt-2 space-y-2">
                {resume.remainingGaps.map((item) => (
                  <li key={item} className="rounded-2xl border border-amber-500/25 bg-amber-100/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
