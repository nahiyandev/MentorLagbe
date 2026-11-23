"use client";

import * as React from "react";
import Link from "next/link";
import {
  ExternalLink,
  Loader2,
  MessageCircle,
  Search,
  ShieldAlert,
  Star,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminUserSummary,
  PaymentRecord,
  TutorProfileData,
  UserRecord,
  UserRole,
} from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate, getInitials, isValidImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

  // Profile Modal state
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [profileUser, setProfileUser] = React.useState<UserRecord | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [tutorStats, setTutorStats] = React.useState<TutorProfileData | null>(null);
  const [studentStats, setStudentStats] = React.useState<AdminUserSummary | null>(null);
  const [allTransactions, setAllTransactions] = React.useState<PaymentRecord[] | null>(null);

  const handleOpenProfileDialog = (u: UserRecord) => {
    setProfileUser(u);
    setTutorStats(null);
    setStudentStats(null);
    setProfileLoading(true);
    setProfileDialogOpen(true);
  };

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
    setProfileUser(null);
    setTutorStats(null);
    setStudentStats(null);
  };

  React.useEffect(() => {
    if (!profileDialogOpen || !profileUser) return;
    const targetUser = profileUser;
    let active = true;

    async function loadStats() {
      try {
        if (!allTransactions) {
          try {
            const txRes = await apiFetch<PaymentRecord[]>("/api/admin/transactions");
            const txList = extractList<PaymentRecord>(txRes);
            if (active) setAllTransactions(txList);
          } catch (txErr) {
            console.warn("Could not load transactions:", txErr);
          }
        }

        if (targetUser.role === "tutor") {
          const res = await apiFetch<TutorProfileData>(
            `/api/profile/tutor/${encodeURIComponent(targetUser.email)}`
          );
          if (active) setTutorStats(res);
        } else if (targetUser.role === "student") {
          const uid = targetUser._id || targetUser.id || targetUser.email;
          const res = await apiFetch<AdminUserSummary>(
            `/api/admin/users/${encodeURIComponent(uid)}/summary`
          );
          if (active) setStudentStats(res);
        }
      } catch (err) {
        console.warn("Could not load user profile summary:", err);
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    void loadStats();
    return () => {
      active = false;
    };
  }, [profileDialogOpen, profileUser, allTransactions]);

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [planFilter, setPlanFilter] = React.useState("all");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePlanFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlanFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPlanFilter("all");
    setCurrentPage(1);
  };

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
      setProfileUser((prev) =>
        prev && (prev._id || prev.id || prev.email) === userId
          ? { ...prev, role: nextRole }
          : prev
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
      setProfileUser((prev) =>
        prev && (prev._id || prev.id || prev.email) === uid
          ? {
              ...prev,
              status: "blocked",
              blockedReason: res?.blockedReason || blockReason.trim(),
            }
          : prev
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
      setProfileUser((prev) =>
        prev && (prev._id || prev.id || prev.email) === uid
          ? { ...prev, status: "active", blockedReason: "" }
          : prev
      );
      toast.success(`User ${u.name} has been unblocked.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unblock user.");
    } finally {
      setUpdatingId(null);
    }
  };

  const isFiltered =
    searchQuery.trim() !== "" ||
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    planFilter !== "all";

  const filteredUsers = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      // Search: name or email contains query (substring, case-insensitive)
      if (q) {
        const nameMatch = u.name?.toLowerCase().includes(q);
        const emailMatch = u.email?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }

      // Role filter
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }

      // Status filter: missing status treated as "active"
      const userStatus = u.status === "blocked" ? "blocked" : "active";
      if (statusFilter !== "all" && userStatus !== statusFilter) {
        return false;
      }

      // Plan filter: missing plan treated as "free"
      const userPlan = (u.plan || "free").toLowerCase();
      if (planFilter !== "all" && userPlan !== planFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter, planFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
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
            Registered Users (
            {loading
              ? "…"
              : isFiltered
                ? `${filteredUsers.length} of ${users.length}`
                : users.length}
            )
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 dark:bg-[#1C2B22]/30 p-10 text-center">
              <p className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
                No users found.
              </p>
            </div>
          ) : (
            <>
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-50 sm:min-w-60">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-[#9DB3A6]" />
                  <Input
                    type="search"
                    placeholder="Search by name or email…"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="h-10 pl-9 text-xs sm:text-sm bg-white dark:bg-[#141F18]"
                    aria-label="Search users"
                  />
                </div>

                <Select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  className="h-10 w-full sm:w-36 text-xs sm:text-sm bg-white dark:bg-[#141F18]"
                  aria-label="Filter by role"
                >
                  <option value="all">All roles</option>
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </Select>

                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="h-10 w-full sm:w-36 text-xs sm:text-sm bg-white dark:bg-[#141F18]"
                  aria-label="Filter by status"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </Select>

                <Select
                  value={planFilter}
                  onChange={handlePlanFilterChange}
                  className="h-10 w-full sm:w-32 text-xs sm:text-sm bg-white dark:bg-[#141F18]"
                  aria-label="Filter by plan"
                >
                  <option value="all">All plans</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </Select>

                {isFiltered && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-10 text-xs font-semibold text-muted hover:text-forest dark:text-[#9DB3A6] dark:hover:text-[#8EE0BA] cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>

              {filteredUsers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 dark:bg-[#1C2B22]/30 p-10 text-center space-y-3">
                  <p className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
                    No users match your filters.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="cursor-pointer"
                  >
                    Clear filters
                  </Button>
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
                            <button
                              type="button"
                              onClick={() => handleOpenProfileDialog(u)}
                              className="flex items-center gap-3 text-left w-full group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 rounded-lg p-1 -m-1"
                              aria-label={`View profile for ${u.name}`}
                            >
                              {isValidImageUrl(u.image) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={u.image!}
                                  alt={u.name}
                                  className="h-9 w-9 shrink-0 rounded-full object-cover border border-sage-border group-hover:ring-2 group-hover:ring-forest/30 transition-all"
                                />
                              ) : (
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white group-hover:ring-2 group-hover:ring-forest/30 transition-all">
                                  {getInitials(u.name)}
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-bold text-forest dark:text-[#8EE0BA] group-hover:underline">
                                  {u.name}
                                </p>
                                <p className="truncate text-xs text-muted dark:text-[#9DB3A6]">
                                  {u.email}
                                </p>
                              </div>
                            </button>
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
                          <td className="py-3.5 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    totalItems={filteredUsers.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleCloseProfileDialog}
        title="User Profile Details"
        description="Inspect account attributes, contact details, platform statistics, and recent activity."
        className="max-w-xl"
      >
        {profileUser && (() => {
          const profileUid = profileUser._id || profileUser.id || profileUser.email;
          const isProfileSelf =
            Boolean(session?.user?.id && (session.user.id === profileUid || session.user.id === profileUser._id)) ||
            Boolean(session?.user?.email && session.user.email.toLowerCase() === profileUser.email.toLowerCase());
          const isProfileAdmin = profileUser.role === "admin";
          const cannotBlockProfile = isProfileSelf || isProfileAdmin;
          const isUpdatingProfile = updatingId === profileUid;
          const userPayments = (allTransactions || []).filter(
            (p) => p.userEmail?.toLowerCase() === profileUser.email.toLowerCase()
          );

          return (
            <div className="space-y-5 pt-2">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-2 border-b border-sage-border">
                {isValidImageUrl(profileUser.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileUser.image!}
                    alt={profileUser.name}
                    className="h-[72px] w-[72px] shrink-0 rounded-full object-cover ring-4 ring-sage-border shadow-xs"
                  />
                ) : (
                  <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-forest text-2xl font-black text-white ring-4 ring-sage-border shadow-xs">
                    {getInitials(profileUser.name)}
                  </span>
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-forest dark:text-[#8EE0BA] truncate">
                      {profileUser.name}
                    </h3>
                    <Badge
                      variant={profileUser.role === "admin" ? "clay" : "sage"}
                      className="capitalize text-xs font-bold"
                    >
                      {profileUser.role}
                    </Badge>
                    <Badge
                      variant={profileUser.plan === "pro" ? "clay" : "outline"}
                      className="capitalize text-xs font-bold"
                    >
                      {profileUser.plan || "free"} plan
                    </Badge>
                  </div>

                  <p className="text-xs text-muted dark:text-[#9DB3A6] truncate">
                    {profileUser.email}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted dark:text-[#9DB3A6] pt-0.5">
                    <span>
                      Phone: <strong className="text-ink dark:text-[#EFF5F0]">{profileUser.phone || "—"}</strong>
                    </span>
                    <span>
                      Member since:{" "}
                      <strong className="text-ink dark:text-[#EFF5F0]">
                        {profileUser.createdAt ? formatDate(profileUser.createdAt) : "—"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges & Status Row */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-muted dark:text-[#9DB3A6]">
                    Status:
                  </span>
                  {profileUser.status === "blocked" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-400">
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Active
                    </span>
                  )}

                  {(profileUser.responseBadge || tutorStats?.tutor?.responseBadge) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <Zap className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                      {profileUser.responseBadge || tutorStats?.tutor?.responseBadge}
                    </span>
                  )}
                </div>

                {profileUser.status === "blocked" && profileUser.blockedReason && (
                  <div className="rounded-xl border border-red-200 bg-red-50/80 p-2.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    <strong className="font-bold">Block Reason:</strong> {profileUser.blockedReason}
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                  Biography
                </p>
                <p className="text-xs text-ink/80 dark:text-[#EFF5F0]/80 leading-relaxed bg-sage-subtle/30 dark:bg-[#1C2B22]/20 p-3 rounded-xl border border-sage-border/60">
                  {profileUser.bio || "No bio added yet."}
                </p>
              </div>

              {/* Stats Row (4 Stat Cards) */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                  Platform Statistics
                </p>

                {profileLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-18 rounded-xl" />
                    ))}
                  </div>
                ) : profileUser.role === "tutor" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Active Batches
                      </p>
                      <p className="mt-1 text-lg font-black text-forest dark:text-[#8EE0BA]">
                        {tutorStats?.stats?.totalBatches ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Subjects
                      </p>
                      <p className="mt-1 text-lg font-black text-clay">
                        {tutorStats?.stats?.subjects?.length ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Avg Rating
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-lg font-black text-forest dark:text-[#8EE0BA]">
                          {tutorStats?.stats?.averageRating ? tutorStats.stats.averageRating.toFixed(1) : "—"}
                        </span>
                        {Boolean(tutorStats?.stats?.averageRating) && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Total Reviews
                      </p>
                      <p className="mt-1 text-lg font-black text-forest dark:text-[#8EE0BA]">
                        {tutorStats?.stats?.totalReviews ?? "—"}
                      </p>
                    </div>
                  </div>
                ) : profileUser.role === "student" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Applications
                      </p>
                      <p className="mt-1 text-lg font-black text-forest dark:text-[#8EE0BA]">
                        {studentStats?.applicationsTotal ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Accepted
                      </p>
                      <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-400">
                        {studentStats?.applicationsAccepted ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Reviews Given
                      </p>
                      <p className="mt-1 text-lg font-black text-forest dark:text-[#8EE0BA]">
                        {studentStats?.reviewsGiven ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Plan Status
                      </p>
                      <p className="mt-1 text-lg font-black text-clay uppercase">
                        {profileUser.plan || "free"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Privilege
                      </p>
                      <p className="mt-1 text-lg font-black text-forest dark:text-[#8EE0BA]">
                        Full Admin
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Access
                      </p>
                      <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-400">
                        Platform
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Status
                      </p>
                      <p className="mt-1 text-lg font-black text-forest dark:text-[#8EE0BA]">
                        Active
                      </p>
                    </div>
                    <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-3 border border-sage-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                        Audits
                      </p>
                      <p className="mt-1 text-lg font-black text-clay">
                        Enabled
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Latest Activity (max 3 items) */}
              {profileUser.role === "tutor" && tutorStats?.tuitions && tutorStats.tuitions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Latest Tuitions
                  </p>
                  <div className="space-y-1.5">
                    {tutorStats.tuitions.slice(0, 3).map((t) => (
                      <div
                        key={t._id}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-sage-subtle/40 dark:bg-[#1C2B22]/30 border border-sage-border/60"
                      >
                        <span className="font-semibold text-forest dark:text-[#8EE0BA] truncate max-w-[260px]">
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-ink dark:text-[#EFF5F0]">৳{t.monthlyFee}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize">
                            {t.approvalStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileUser.role === "student" && studentStats?.latestApplications && studentStats.latestApplications.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Latest Applications
                  </p>
                  <div className="space-y-1.5">
                    {studentStats.latestApplications.slice(0, 3).map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-sage-subtle/40 dark:bg-[#1C2B22]/30 border border-sage-border/60"
                      >
                        <span className="font-semibold text-forest dark:text-[#8EE0BA] truncate max-w-[260px]">
                          {a.tuitionTitle}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize">
                            {a.status}
                          </Badge>
                          {a.appliedAt && (
                            <span className="text-[11px] text-muted dark:text-[#9DB3A6]">
                              {formatDate(a.appliedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profileUser.role === "student" && studentStats?.latestReviews && studentStats.latestReviews.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Latest Reviews Given
                  </p>
                  <div className="space-y-1.5">
                    {studentStats.latestReviews.slice(0, 3).map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-sage-subtle/40 dark:bg-[#1C2B22]/30 border border-sage-border/60"
                      >
                        <span className="font-semibold text-forest dark:text-[#8EE0BA] truncate max-w-[260px]">
                          {r.tuitionTitle}
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {r.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Section */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                  Payments History
                </p>
                {userPayments.length === 0 ? (
                  <p className="text-xs text-muted dark:text-[#9DB3A6] italic py-1">
                    No payments yet.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {userPayments.map((p, idx) => (
                      <div
                        key={p._id || p.transactionId || idx}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-sage-subtle/40 dark:bg-[#1C2B22]/30 border border-sage-border/60"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-forest dark:text-[#8EE0BA] block truncate capitalize">
                            {p.planName || "Pro Subscription"}
                          </span>
                          <span className="text-[11px] text-muted dark:text-[#9DB3A6]">
                            {p.paidAt ? formatDate(p.paidAt) : "—"} via{" "}
                            <span className="capitalize font-medium text-ink dark:text-[#EFF5F0]">
                              {p.paymentMethod || "Stripe"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-ink dark:text-[#EFF5F0]">
                            {(p.currency || "BDT").toUpperCase()} {p.amount}
                          </span>
                          <Badge
                            variant={p.paymentStatus === "completed" ? "sage" : "outline"}
                            className="text-[10px] py-0 px-1.5 capitalize"
                          >
                            {p.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin Actions Row */}
              <div className="pt-2 border-t border-sage-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted dark:text-[#9DB3A6]">
                    Role:
                  </span>
                  {isUpdatingProfile && (
                    <Loader2 className="h-4 w-4 animate-spin text-forest" />
                  )}
                  <Select
                    value={profileUser.role}
                    disabled={isUpdatingProfile || isProfileSelf}
                    aria-label={`Change role for ${profileUser.name}`}
                    className="h-8 w-28 capitalize text-xs bg-white dark:bg-[#141F18]"
                    onChange={(e) =>
                      handleRoleChange(profileUid, e.target.value as UserRole)
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </div>

                {!cannotBlockProfile && (
                  <div>
                    {profileUser.status === "blocked" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isUpdatingProfile}
                        onClick={() => handleUnblock(profileUser)}
                        className="h-8 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/40 text-xs font-semibold cursor-pointer"
                      >
                        Unblock Account
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isUpdatingProfile}
                        onClick={() => handleOpenBlockDialog(profileUser)}
                        className="h-8 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40 text-xs font-semibold cursor-pointer"
                      >
                        Block Account
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Dialog Footer with View Profile and Message button */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-sage-border mt-3">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {profileUser.role === "tutor" ? (
                    <Link
                      href={`/tutors/${encodeURIComponent(profileUser.email)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0"
                    >
                      <Button type="button" className="gap-2 cursor-pointer font-bold">
                        <ExternalLink className="h-4 w-4" />
                        View Profile
                      </Button>
                    </Link>
                  ) : profileUser.role === "student" ? (
                    <Link
                      href={`/students/${encodeURIComponent(profileUser.email)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0"
                    >
                      <Button type="button" className="gap-2 cursor-pointer font-bold">
                        <ExternalLink className="h-4 w-4" />
                        View Profile
                      </Button>
                    </Link>
                  ) : null}

                  <Link
                    href={`/dashboard/messages?user=${encodeURIComponent(profileUser.email)}`}
                    className="shrink-0"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 cursor-pointer font-semibold"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </Link>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseProfileDialog}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Dialog>

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
