import { api, ApiError, getApiUrl } from "@abeera/shared";

type FetchOptions = RequestInit & {
  token?: string;
};

export { ApiError, getApiUrl };

export const apiClient = {
  get: <T>(path: string, opts?: FetchOptions) =>
    api.get<T>(
      path,
      opts?.cache === "no-store" ? opts : { ...opts, next: { revalidate: 60 } },
    ),
  post: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    api.post<T>(path, body, { cache: "no-store", ...opts }),
  patch: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    api.patch<T>(path, body, { cache: "no-store", ...opts }),
  delete: <T>(path: string, opts?: FetchOptions) =>
    api.delete<T>(path, { cache: "no-store", ...opts }),
};
