"use client";

import * as React from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { UserRecord, UserRole } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate, getInitials, isValidImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const ROLES: UserRole[] = ["student", "tutor", "admin"];

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // Block Modal state
  const [blockDialogOpen, setBlockDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserRecord | null>(null);
  const [blockReason, setBlockReason] = React.useState("");
  const [submittingStatus, setSubmittingStatus] = React.useState(false);

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<unknown>("/api/admin/users");
        if (active) {
          setUsers(extractList<UserRecord>(res, "users"));
        }
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
        if (active) {
          setLoading(false);
        }
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

  const handleOpenBlockDialog = (u: UserRecord) => {
    setSelectedUser(u);
    setBlockReason("");
    setBlockDialogOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedUser) return;
    const uid = selectedUser._id || selectedUser.id || selectedUser.email;
    setSubmittingStatus(true);
    try {
      const res = await apiFetch<UserRecord>(
        `/api/admin/users/${encodeURIComponent(uid)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "blocked",
            reason: blockReason.trim(),
          }),
        }
      );
      setUsers((prev) =>
        prev.map((u) =>
          (u._id || u.id) === uid
            ? {
                ...u,
                status: "blocked",
                blockedReason: res?.blockedReason || blockReason.trim(),
              }
            : u
        )
      );
      toast.success(`User ${selectedUser.name} has been blocked.`);
      setBlockDialogOpen(false);
      setSelectedUser(null);
      setBlockReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to block user.");
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleUnblock = async (u: UserRecord) => {
    const uid = u._id || u.id || u.email;
    setUpdatingId(uid);
    try {
      await apiFetch<UserRecord>(
        `/api/admin/users/${encodeURIComponent(uid)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "active" }),
        }
      );
      setUsers((prev) =>
        prev.map((userItem) =>
          (userItem._id || userItem.id) === uid
            ? { ...userItem, status: "active", blockedReason: "" }
            : userItem
        )
      );
      toast.success(`User ${u.name} has been unblocked.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unblock user.");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-forest sm:text-3xl dark:text-[#8EE0BA]">
          User Management
        </h1>
        <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
          Inspect registered accounts, change roles, and freeze/unblock accounts with audit notifications.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
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
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-sage-border text-xs uppercase tracking-wider text-muted">
                      <th className="pb-3 pr-4 font-bold">User</th>
                      <th className="pb-3 px-4 font-bold">Plan</th>
                      <th className="pb-3 px-4 font-bold">Joined</th>
                      <th className="pb-3 px-4 font-bold">Status</th>
                      <th className="pb-3 px-4 font-bold">Role</th>
                      <th className="pb-3 pl-4 text-right font-bold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-border">
                    {paginatedUsers.map((u) => {
                      const uid = u._id || u.id || u.email;
                      const isUpdating = updatingId === uid;
                      const isSelf =
                        Boolean(session?.user?.id && (session.user.id === uid || session.user.id === u._id)) ||
                        Boolean(session?.user?.email && session.user.email.toLowerCase() === u.email.toLowerCase());
                      const isAdminRole = u.role === "admin";
                      const cannotBlock = isSelf || isAdminRole;

                      return (
                        <tr key={uid} className="hover:bg-sage-bg/40 dark:hover:bg-[#1C2B22]/20">
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
                                <p className="truncate font-bold text-forest dark:text-[#8EE0BA]">
                                  {u.name}
                                </p>
                                <p className="truncate text-xs text-muted dark:text-[#9DB3A6]">
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
                          <td className="py-3.5 px-4 text-muted dark:text-[#9DB3A6]">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.status === "blocked" ? (
                              <div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-400">
                                  Blocked
                                </span>
                                {u.blockedReason && (
                                  <p
                                    className="mt-1 text-xs text-red-600 dark:text-red-400 truncate max-w-[170px]"
                                    title={u.blockedReason}
                                  >
                                    {u.blockedReason}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                Active
                              </span>
                            )}
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
                            <div className="inline-flex items-center justify-end gap-2">
                              {isUpdating && (
                                <Loader2 className="h-4 w-4 animate-spin text-forest" />
                              )}
                              <Select
                                value={u.role}
                                disabled={isUpdating || isSelf}
                                aria-label={`Change role for ${u.name}`}
                                className="h-9 w-28 capitalize text-xs"
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

                              {/* Block / Unblock Button (hidden on self and admins) */}
                              {!cannotBlock && (
                                <>
                                  {u.status === "blocked" ? (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={isUpdating}
                                      onClick={() => handleUnblock(u)}
                                      className="h-9 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/40 text-xs font-semibold"
                                    >
                                      Unblock
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={isUpdating}
                                      onClick={() => handleOpenBlockDialog(u)}
                                      className="h-9 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40 text-xs font-semibold"
                                    >
                                      Block
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={users.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Block Confirmation Dialog */}
      <Dialog
        open={blockDialogOpen}
        onClose={() => {
          if (!submittingStatus) {
            setBlockDialogOpen(false);
            setSelectedUser(null);
          }
        }}
        title={`Block User: ${selectedUser?.name || ""}`}
        description="This user can still log in, but all mutations (posting tuitions, applications, reviews, payments) will be blocked. They can only message Support to appeal."
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold">Account Freeze Notice:</p>
              <p className="mt-0.5 leading-relaxed">
                User ({selectedUser?.email}) will see a red suspension banner on their dashboard and will only be able to appeal via Admin Support chat.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blockReason" className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
              Reason for blocking (visible to the user)
            </Label>
            <Textarea
              id="blockReason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g. Inappropriate profile details, policy violation, or report from tutor/student..."
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sage-border">
            <Button
              type="button"
              variant="ghost"
              disabled={submittingStatus}
              onClick={() => {
                setBlockDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submittingStatus}
              onClick={handleConfirmBlock}
              className="bg-red-700 hover:bg-red-800 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              {submittingStatus && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              Block Account
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
