"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUserState {
  user: CurrentUser | null;
  loading: boolean;
}

export function useCurrentUser(): CurrentUserState {
  const [state, setState] = useState<CurrentUserState>({ user: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setState({ user: (data?.user as CurrentUser | null) ?? null, loading: false });
      } catch {
        if (!cancelled) setState({ user: null, loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
