import Link from "next/link";
import { redirect } from "next/navigation";
import type { HomepageDocumentResponse } from "@abeera/shared";

import { HomepageForm } from "@/components/admin/homepage-form";
import { Button } from "@/components/ui/button";
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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Homepage</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Edit the copy and images on the storefront homepage. Image fields take a public URL — there is no file
            upload on this page. Product cards in the rail still come from the catalog.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/" target="_blank" rel="noreferrer">
            View storefront
          </Link>
        </Button>
      </div>
      <HomepageForm initial={document} />
    </div>
  );
}
