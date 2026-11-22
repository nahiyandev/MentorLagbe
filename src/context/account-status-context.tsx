"use client";

import * as React from "react";
import type { UserRecord } from "@/types";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

interface AccountStatusContextValue {
  isBlocked: boolean;
  blockedReason: string;
  profile: UserRecord | null;
  loading: boolean;
  refetch: () => void;
}

const AccountStatusContext = React.createContext<AccountStatusContextValue>({
  isBlocked: false,
  blockedReason: "",
  profile: null,
  loading: false,
  refetch: () => {},
});

export function AccountStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [profile, setProfile] = React.useState<UserRecord | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    async function load() {
      if (!session?.user?.email) {
        setProfile(null);
        return;
      }
      try {
        setLoading(true);
        const res = await apiFetch<UserRecord>("/api/profile");
        if (active && res) {
          setProfile(res);
        }
      } catch {
        // Non-blocking
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [session?.user?.email, refreshKey]);

  const isBlocked = profile?.status === "blocked";
  const blockedReason = profile?.blockedReason || "";

  const refetch = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <AccountStatusContext.Provider
      value={{
        isBlocked,
        blockedReason,
        profile,
        loading,
        refetch,
      }}
    >
      {children}
    </AccountStatusContext.Provider>
  );
}

export function useAccountStatus() {
  return React.useContext(AccountStatusContext);
}
