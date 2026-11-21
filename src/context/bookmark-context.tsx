"use client";

import * as React from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

interface BookmarkContextType {
  bookmarkedIds: Set<string>;
  isBookmarked: (tuitionId: string) => boolean;
  toggleBookmark: (tuitionId: string) => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;
}

const BookmarkContext = React.createContext<BookmarkContextType | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [bookmarkedIds, setBookmarkedIds] = React.useState<Set<string>>(new Set());

  const userEmail = session?.user?.email;

  const refreshBookmarks = React.useCallback(async () => {
    if (!userEmail) {
      setBookmarkedIds(new Set());
      return;
    }
    try {
      const res = await apiFetch<{ ids: string[] }>("/api/bookmarks/ids");
      if (Array.isArray(res?.ids)) {
        setBookmarkedIds(new Set(res.ids));
      }
    } catch {
      // Guest or network error, silently keep current
    }
  }, [userEmail]);

  React.useEffect(() => {
    if (!userEmail) return;
    let active = true;

    async function load() {
      try {
        const res = await apiFetch<{ ids: string[] }>("/api/bookmarks/ids");
        if (active && Array.isArray(res?.ids)) {
          setBookmarkedIds(new Set(res.ids));
        }
      } catch {
        // Guest or network error
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [userEmail]);

  const isBookmarked = React.useCallback(
    (tuitionId: string) => {
      return bookmarkedIds.has(tuitionId);
    },
    [bookmarkedIds]
  );

  const toggleBookmark = React.useCallback(
    async (tuitionId: string): Promise<boolean> => {
      if (!session?.user) {
        toast.error("Please sign in as a student to save tuitions.");
        return false;
      }

      // Optimistic state toggle
      const wasBookmarked = bookmarkedIds.has(tuitionId);
      const nextSet = new Set(bookmarkedIds);
      if (wasBookmarked) {
        nextSet.delete(tuitionId);
      } else {
        nextSet.add(tuitionId);
      }
      setBookmarkedIds(nextSet);

      try {
        const res = await apiFetch<{ bookmarked: boolean; message: string }>(
          "/api/bookmarks/toggle",
          {
            method: "POST",
            body: JSON.stringify({ tuitionId }),
          }
        );

        if (res?.bookmarked) {
          toast.success(res.message || "Tuition saved to your bookmarks!");
        } else {
          toast.info(res.message || "Tuition removed from bookmarks.");
        }
        return res?.bookmarked ?? !wasBookmarked;
      } catch (err) {
        // Rollback on error
        setBookmarkedIds(bookmarkedIds);
        toast.error(
          err instanceof Error ? err.message : "Failed to update bookmark"
        );
        return wasBookmarked;
      }
    },
    [session?.user, bookmarkedIds]
  );

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedIds,
        isBookmarked,
        toggleBookmark,
        refreshBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = React.useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
