"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Loader2,
  Percent,
  Plus,
  RefreshCw,
  Sparkles,
  Tag,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { CouponRecord } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = React.useState<CouponRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [discountValue, setDiscountValue] = React.useState("10");
  const [maxUses, setMaxUses] = React.useState("100");
  const [description, setDescription] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");

  // Action states
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const loadCoupons = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<unknown>("/api/admin/coupons");
      const list = extractList<CouponRecord>(res, "coupons");
      setCoupons(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load discount coupons."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    async function fetchInitial() {
      try {
        const res = await apiFetch<unknown>("/api/admin/coupons");
        if (active) {
          const list = extractList<CouponRecord>(res, "coupons");
          setCoupons(list);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load discount coupons."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchInitial();
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = (codeStr: string) => {
    void navigator.clipboard.writeText(codeStr);
    setCopiedCode(codeStr);
    toast.success(`Copied code "${codeStr}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter a coupon code.");
      return;
    }
    const val = Number(discountValue);
    if (!val || val <= 0 || val > 100) {
      toast.error("Discount percentage must be between 1% and 100%.");
      return;
    }

    setCreating(true);
    try {
      const created = await apiFetch<CouponRecord>("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: cleanCode,
          discountType: "percentage",
          discountValue: val,
          maxUses: Number(maxUses) || 100,
          description: description.trim(),
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });

      toast.success(`Coupon code "${created.code}" created successfully!`);
      setCoupons((prev) => [created, ...prev]);
      setCreateModalOpen(false);
      setCode("");
      setDescription("");
      setExpiresAt("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create coupon code."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (coupon: CouponRecord) => {
    setTogglingId(coupon._id);
    try {
      const updated = await apiFetch<CouponRecord>(
        `/api/admin/coupons/${coupon._id}/toggle`,
        { method: "PATCH" }
      );
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? updated : c))
      );
      toast.success(
        `Coupon "${coupon.code}" is now ${updated.isActive ? "Active" : "Disabled"}.`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update coupon status."
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (coupon: CouponRecord) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete coupon "${coupon.code}"?`
      )
    ) {
      return;
    }

    setDeletingId(coupon._id);
    try {
      await apiFetch(`/api/admin/coupons/${coupon._id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
      toast.success(`Coupon "${coupon.code}" deleted.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete coupon."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalRedeemed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const activeCoupons = coupons.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-forest dark:text-[#8EE0BA] sm:text-3xl">
            <TicketPercent className="h-7 w-7 text-clay" />
            Coupons &amp; Promo Codes
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
            Create and manage promotional discount codes for Pro membership upgrades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCoupons}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </Button>
        </div>
      </div>

      {/* Summary Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Total Coupons
              </p>
              <p className="mt-1 text-2xl font-black text-forest dark:text-[#8EE0BA]">
                {coupons.length}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-subtle text-forest">
              <Tag className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Active Codes
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-600">
                {activeCoupons}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Sparkles className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Total Redemptions
              </p>
              <p className="mt-1 text-2xl font-black text-clay">
                {totalRedeemed}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay/10 text-clay">
              <Percent className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Coupons Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Promotional Codes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <TicketPercent className="mx-auto h-12 w-12 text-muted/40 mb-3" />
              <p className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                No discount coupons created yet
              </p>
              <p className="mt-1 text-xs text-muted">
                Click &ldquo;Create Coupon&rdquo; to launch your first promotional discount.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Coupon Now
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-sage-border bg-sage-bg/50 dark:bg-[#141F18] text-xs font-bold text-muted dark:text-[#9DB3A6] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Redemptions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expiration</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-border">
                  {coupons.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-sage-subtle/30 dark:hover:bg-[#1C2B22]/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-forest dark:text-[#8EE0BA]">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-sage-subtle px-2 py-0.5 border border-sage-border">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.code)}
                            className="text-muted hover:text-forest transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        {c.description && (
                          <span className="block text-[11px] font-normal text-muted mt-0.5">
                            {c.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="clay" className="font-black text-xs">
                          {c.discountValue}% OFF
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-muted dark:text-[#9DB3A6]">
                        <span className="font-semibold text-forest dark:text-[#8EE0BA]">
                          {c.usedCount}
                        </span>{" "}
                        / {c.maxUses}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={c.isActive ? "success" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleToggle(c)}
                        >
                          {togglingId === c._id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          {c.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted dark:text-[#9DB3A6]">
                        {c.expiresAt ? formatDate(c.expiresAt) : "Never expires"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted dark:text-[#9DB3A6]">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={togglingId === c._id}
                            onClick={() => handleToggle(c)}
                            className="text-xs"
                          >
                            {c.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === c._id}
                            onClick={() => handleDelete(c)}
                            className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            {deletingId === c._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Coupon Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Coupon Code"
        description="Add a promotional discount code that students or tutors can use during Pro upgrade."
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="couponCode">Coupon Code (Uppercase)</Label>
            <Input
              id="couponCode"
              type="text"
              placeholder="e.g. WELCOME10, SPECIAL20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="uppercase font-mono tracking-wider"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="discountValue">Discount Percentage (%)</Label>
              <Input
                id="discountValue"
                type="number"
                min={1}
                max={100}
                placeholder="10"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxUses">Usage Limit (Max Uses)</Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                placeholder="100"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Campaign Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g. Welcome discount for early student & tutor adopters"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Creating...
                </>
              ) : (
                "Save & Activate Coupon"
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
