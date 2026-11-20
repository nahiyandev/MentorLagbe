"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { NotificationItem } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";

export function NotificationBell() {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let active = true;

    async function load() {
      if (!session?.user?.email) return;
      try {
        const res = await apiFetch<{
          notifications?: NotificationItem[];
          unreadCount?: number;
        }>("/api/notifications");

        if (active) {
          const items = extractList<NotificationItem>(res, "notifications");
          setNotifications(items);
          setUnreadCount(
            typeof res?.unreadCount === "number"
              ? res.unreadCount
              : items.filter((n) => !n.isRead).length
          );
        }
      } catch {
        // Non-intrusive error handling
      }
    }

    void load();
    const interval = setInterval(() => {
      void load();
    }, 30000); // 30s polling

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [session?.user?.email]);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await apiFetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link) {
        setOpen(false);
        router.push(link);
      }
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await apiFetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) return null;

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "application_accepted":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "application_rejected":
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case "application_received":
        return <GraduationCap className="h-4 w-4 text-forest dark:text-[#8EE0BA]" />;
      default:
        return <Sparkles className="h-4 w-4 text-clay" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-sage-border bg-white dark:bg-[#141F18] text-forest dark:text-[#8EE0BA] shadow-xs transition-colors hover:border-forest/40 hover:bg-sage-subtle/50 dark:hover:bg-[#1C2B22] cursor-pointer"
        aria-label="View notifications"
        aria-expanded={open}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-sage-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-md bg-sage-subtle dark:bg-[#1C2B22] px-1.5 py-0.5 text-[10px] font-bold text-forest dark:text-[#8EE0BA]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-semibold text-clay hover:underline cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-sage-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted/40 mb-2" />
                <p className="text-xs font-semibold text-muted dark:text-[#9DB3A6]">
                  No notifications yet
                </p>
                <p className="mt-0.5 text-[11px] text-muted/70">
                  You will be notified when applications or updates arrive.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleMarkAsRead(item._id, item.link)}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    item.isRead
                      ? "hover:bg-sage-bg/40 dark:hover:bg-[#1C2B22]/40"
                      : "bg-sage-subtle/30 dark:bg-[#1C2B22]/60 hover:bg-sage-subtle/60"
                  }`}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#141F18] shadow-xs">
                    {getIcon(item.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold truncate ${item.isRead ? "text-forest dark:text-[#8EE0BA]" : "text-ink dark:text-[#EFF5F0]"}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted dark:text-[#9DB3A6] shrink-0 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted dark:text-[#9DB3A6] line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.link && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-forest dark:text-[#8EE0BA] hover:underline">
                        <span>View Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {!item.isRead && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
