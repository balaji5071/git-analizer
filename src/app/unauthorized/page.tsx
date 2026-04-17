import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="pt-4 text-2xl">Access restricted</CardTitle>
          <CardDescription>
            Your account does not have permission to open that dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-medium text-slate-950 shadow-[0_14px_32px_rgba(34,197,94,0.25)] transition hover:bg-emerald-400"
          >
            Return to Dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
