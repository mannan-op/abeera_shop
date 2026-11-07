"use server";

import { redirect } from "next/navigation";

import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

export type MediaAsset = {
  id: string;
  url: string;
  publicId: string | null;
  source: "cloudinary" | "link";
  filename: string;
  alt: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  format: string | null;
  createdAt: string;
};

export type MediaList = { items: MediaAsset[]; total: number; cloudinaryConfigured: boolean };
export type MediaUsage = { kind: string; label: string; href: string }[];
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function token() {
  const t = await getAccessToken();
  if (!t) redirect("/admin/login");
  return t;
}

async function run<T>(fn: (t: string) => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn(await token()) };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    throw error;
  }
}

export async function listMediaAction(search = "", source = "") {
  const q = new URLSearchParams({ pageSize: "120" });
  if (search) q.set("search", search);
  if (source) q.set("source", source);
  return run((t) => apiClient.get<MediaList>(`/admin/media?${q}`, { token: t, cache: "no-store" }));
}

export async function addMediaLinkAction(url: string, alt = "") {
  return run((t) => apiClient.post<MediaAsset>("/admin/media", { url, alt }, { token: t }));
}

export async function updateMediaAltAction(id: string, alt: string) {
  return run((t) => apiClient.patch<MediaAsset>(`/admin/media/${id}`, { alt }, { token: t }));
}

export async function deleteMediaAction(id: string) {
  return run((t) => apiClient.delete<{ deleted: boolean }>(`/admin/media/${id}`, { token: t }));
}

export async function mediaUsageAction(id: string) {
  return run((t) => apiClient.get<MediaUsage>(`/admin/media/${id}/usage`, { token: t, cache: "no-store" }));
}
