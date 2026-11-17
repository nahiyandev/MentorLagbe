const DEFAULT_SERVER_URL = "https://mentor-lagbe-server.vercel.app";

export const JWT_STORAGE_KEY = "mentorlagbe_jwt";

export function getServerUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL || DEFAULT_SERVER_URL;
  return raw.replace(/\/+$/, "");
}

export function getStoredJwt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(JWT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredJwt(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(JWT_STORAGE_KEY, token);
  } catch {
    // Ignore storage quota / private mode errors
  }
}

export function clearStoredJwt(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(JWT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getServerUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const jwt = getStoredJwt();
  if (jwt && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${jwt}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  let parsed: unknown = null;

  if (contentType.includes("application/json")) {
    try {
      parsed = await res.json();
    } catch {
      parsed = null;
    }
  } else {
    const text = await res.text().catch(() => "");
    parsed = text || null;
  }

  if (!res.ok) {
    const msg =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message?: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : typeof parsed === "object" &&
            parsed !== null &&
            "error" in parsed &&
            typeof (parsed as { error?: unknown }).error === "string"
          ? (parsed as { error: string }).error
          : `Request failed with status ${res.status}`;
    throw new ApiError(msg, res.status, parsed);
  }

  return parsed as T;
}

export async function exchangeSessionForJwt(
  sessionToken?: string | null
): Promise<string | null> {
  if (!sessionToken) return null;

  try {
    const res = await fetch(`${getServerUrl()}/api/auth/jwt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ sessionToken }),
    });

    if (res.status === 404) {
      console.warn(
        "[MentorLagbe] POST /api/auth/jwt returned 404 (endpoint not live yet). Continuing with BetterAuth session."
      );
      return null;
    }

    if (!res.ok) {
      console.warn(
        `[MentorLagbe] Failed to exchange BetterAuth session for JWT (status ${res.status}).`
      );
      return null;
    }

    const data = (await res.json()) as {
      token?: string;
      jwt?: string;
      accessToken?: string;
    };
    const token = data.token || data.jwt || data.accessToken || null;
    if (token) {
      setStoredJwt(token);
    }
    return token;
  } catch (err) {
    console.warn("[MentorLagbe] Could not reach /api/auth/jwt:", err);
    return null;
  }
}

export function extractList<T>(payload: unknown, key?: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (key && Array.isArray(obj[key])) return obj[key] as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}
