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
  refetch: () => Promise<void>;
}

const AccountStatusContext = React.createContext<AccountStatusContextValue>({
  isBlocked: false,
  blockedReason: "",
  profile: null,
  loading: false,
  refetch: async () => {},
});

export function AccountStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [profile, setProfile] = React.useState<UserRecord | null>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchProfile = React.useCallback(async () => {
    if (!session?.user?.email) {
      setProfile(null);
      return;
    }
    try {
      setLoading(true);
      const res = await apiFetch<UserRecord>("/api/profile");
      if (res) {
        setProfile(res);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  React.useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const isBlocked = profile?.status === "blocked";
  const blockedReason = profile?.blockedReason || "";

  return (
    <AccountStatusContext.Provider
      value={{
        isBlocked,
        blockedReason,
        profile,
        loading,
        refetch: fetchProfile,
      }}
    >
      {children}
    </AccountStatusContext.Provider>
  );
}

export function useAccountStatus() {
  return React.useContext(AccountStatusContext);
}
