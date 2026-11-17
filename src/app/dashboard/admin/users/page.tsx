"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UserRecord, UserRole } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { formatDate, getInitials, isValidImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const ROLES: UserRole[] = ["student", "tutor", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<unknown>("/api/admin/users");
        if (active) setUsers(extractList<UserRecord>(res, "users"));
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Backend JWT token is missing or expired. Once POST /api/auth/jwt is live on the server, sign in again to manage users."
            );
          } else {
            setError(
              err instanceof Error ? err.message : "Could not load users."
            );
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleRoleChange = async (userId: string, nextRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      setUsers((prev) =>
        prev.map((u) =>
          (u._id || u.id) === userId ? { ...u, role: nextRole } : u
        )
      );
      toast.success(`Role updated to ${nextRole}.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
          User Management
        </h1>
        <p className="mt-1 text-sm text-muted">
          Inspect registered accounts and update roles between Student, Tutor,
          and Admin.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Registered Users ({loading ? "…" : users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-10 text-center">
              <p className="text-sm font-semibold text-forest">
                No users found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sage-border text-xs uppercase tracking-wider text-muted">
                    <th className="pb-3 pr-4 font-bold">User</th>
                    <th className="pb-3 px-4 font-bold">Plan</th>
                    <th className="pb-3 px-4 font-bold">Joined</th>
                    <th className="pb-3 px-4 font-bold">Role</th>
                    <th className="pb-3 pl-4 text-right font-bold">
                      Change Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-border">
                  {users.map((u) => {
                    const uid = u._id || u.id || u.email;
                    const isUpdating = updatingId === uid;
                    return (
                      <tr key={uid} className="hover:bg-sage-bg/40">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            {isValidImageUrl(u.image) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.image!}
                                alt={u.name}
                                className="h-9 w-9 shrink-0 rounded-full object-cover border border-sage-border"
                              />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                                {getInitials(u.name)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-bold text-forest">
                                {u.name}
                              </p>
                              <p className="truncate text-xs text-muted">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={u.plan === "pro" ? "clay" : "outline"}
                            className="capitalize"
                          >
                            {u.plan || "free"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-muted">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={u.role === "admin" ? "clay" : "sage"}
                            className="capitalize"
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {isUpdating && (
                              <Loader2 className="h-4 w-4 animate-spin text-forest" />
                            )}
                            <Select
                              value={u.role}
                              disabled={isUpdating}
                              aria-label={`Change role for ${u.name}`}
                              className="h-9 w-32 capitalize"
                              onChange={(e) =>
                                handleRoleChange(
                                  uid,
                                  e.target.value as UserRole
                                )
                              }
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
