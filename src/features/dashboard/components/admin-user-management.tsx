"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableSection,
} from "@/components/ui/table";
import { formatDate } from "@/utils/format";

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "individual" | "recruiter" | "admin";
  githubUsername: string | null;
  bookmarksCount: number;
  createdAt: string;
  lastLoginAt: string | null;
};

export function AdminUserManagement({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: AdminUserRow[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "individual" as "individual" | "recruiter" | "admin",
    githubUsername: "",
  });

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [users],
  );

  async function createUser() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as {
      error?: string;
      user?: AdminUserRow;
    };

    setIsSubmitting(false);

    if (!response.ok || !payload.user) {
      setError(payload.error ?? "Unable to create user.");
      return;
    }

    setUsers((current) => [payload.user!, ...current]);
    setMessage("User created successfully.");
    setForm({
      name: "",
      email: "",
      password: "",
      role: "individual",
      githubUsername: "",
    });
  }

  async function updateRole(userId: string, role: AdminUserRow["role"]) {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role }),
    });

    const payload = (await response.json()) as {
      error?: string;
      user?: AdminUserRow;
    };

    if (!response.ok || !payload.user) {
      setError(payload.error ?? "Unable to update role.");
      return;
    }

    setUsers((current) =>
      current.map((user) => (user.id === payload.user!.id ? payload.user! : user)),
    );
    setMessage("User role updated.");
  }

  async function deleteUser(userId: string) {
    const confirmed = window.confirm("Delete this user account? This action cannot be undone.");

    if (!confirmed) {
      return;
    }

    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const payload = (await response.json()) as {
      error?: string;
      success?: boolean;
    };

    if (!response.ok || !payload.success) {
      setError(payload.error ?? "Unable to delete user.");
      return;
    }

    setUsers((current) => current.filter((user) => user.id !== userId));
    setMessage("User deleted.");
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-[var(--foreground)]">Users</h3>
        <p className="text-sm text-[var(--muted)]">
          Create users, update roles, or remove accounts directly from admin dashboard.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-semibold text-[var(--foreground)]">Create user</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <Input
            placeholder="GitHub username (optional)"
            value={form.githubUsername}
            onChange={(event) =>
              setForm((current) => ({ ...current, githubUsername: event.target.value }))
            }
          />
          <select
            className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none"
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as "individual" | "recruiter" | "admin",
              }))
            }
          >
            <option value="individual">Individual</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={createUser} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create user"}
          </Button>
          {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>GitHub</TableHead>
            <TableHead>Bookmarks</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last login</TableHead>
            <TableHead>Actions</TableHead>
          </tr>
        </thead>
        <TableSection>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <select
                  className="h-9 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-sm capitalize text-[var(--foreground)]"
                  value={user.role}
                  onChange={(event) =>
                    updateRole(
                      user.id,
                      event.target.value as "individual" | "recruiter" | "admin",
                    )
                  }
                  disabled={user.id === currentAdminId}
                >
                  <option value="individual">individual</option>
                  <option value="recruiter">recruiter</option>
                  <option value="admin">admin</option>
                </select>
              </TableCell>
              <TableCell>{user.githubUsername ?? "Not set"}</TableCell>
              <TableCell>{user.bookmarksCount}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteUser(user.id)}
                  disabled={user.id === currentAdminId}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </section>
  );
}
