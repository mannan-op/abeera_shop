import { NextResponse } from "next/server";

import { getAccessToken } from "@/lib/admin/auth";
import { API_URL } from "@/lib/auth/cookies";

/** Forwards an admin's image upload to the API (Cloudinary) with their session token. */
export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });

  const incoming = await request.formData();
  const file = incoming.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "Choose an image file." }, { status: 400 });

  const form = new FormData();
  form.set("file", file, file.name);
  form.set("alt", String(incoming.get("alt") ?? ""));
  const res = await fetch(`${API_URL}/media/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({ message: "Upload failed." }));
  return NextResponse.json(body, { status: res.status });
}
