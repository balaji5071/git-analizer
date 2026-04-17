import { SettingsForm } from "@/features/dashboard/components/settings-form";
import { requirePageSession } from "@/features/auth/server/session";

export default async function SettingsPage() {
  await requirePageSession();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Account settings
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Manage profile, security, and resume details.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          Keep your account information current, update credentials, and upload your latest resume.
        </p>
      </section>

      <SettingsForm />
    </div>
  );
}
