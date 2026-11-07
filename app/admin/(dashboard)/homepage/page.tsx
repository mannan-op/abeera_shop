import { redirect } from "next/navigation";
import type { HomepageDocumentResponse } from "@abeera/shared";

import { HomepageForm } from "@/components/admin/homepage-form";
import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

export default async function AdminHomepagePage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");

  let document: HomepageDocumentResponse;
  try {
    document = await apiClient.get<HomepageDocumentResponse>("/admin/homepage", {
      token,
      cache: "no-store",
    });
  } catch (error) {
    const detail = error instanceof ApiError ? error.message : "The API did not respond.";
    return (
      <div>
        <h1 className="font-serif text-3xl">Homepage</h1>
        <p className="mt-4 max-w-xl text-sm text-destructive">Could not load homepage content. {detail}</p>
      </div>
    );
  }

  return <HomepageForm initial={document} />;
}
