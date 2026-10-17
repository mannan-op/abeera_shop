const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type FetchOptions = RequestInit & {
  token?: string;
};

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? "Request failed");
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiUrl() {
  return API_URL;
}

export const api = {
  get: <T>(path: string, opts?: FetchOptions) => request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(path, { ...opts, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(path, { ...opts, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, opts?: FetchOptions) => request<T>(path, { ...opts, method: "DELETE" }),
};
