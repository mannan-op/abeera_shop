"use client";

import { useState, useTransition } from "react";

import { btnClass, dangerBtnClass, primaryBtnClass } from "@/components/admin/admin-ui";
import { deleteReviewAction, setReviewStatusAction } from "@/lib/admin/reviews";

export function ReviewActions({ id, status, slug }: { id: string; status: "PENDING" | "PUBLISHED" | "HIDDEN"; slug: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await fn();
      setError(res.ok ? null : (res.error ?? "Failed"));
    });

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex gap-1.5">
        {status !== "PUBLISHED" ? (
          <button type="button" className={primaryBtnClass} disabled={pending} onClick={() => act(() => setReviewStatusAction(id, "PUBLISHED", slug))}>
            Approve
          </button>
        ) : null}
        {status !== "HIDDEN" ? (
          <button type="button" className={btnClass} disabled={pending} onClick={() => act(() => setReviewStatusAction(id, "HIDDEN", slug))}>
            Hide
          </button>
        ) : null}
        <button
          type="button"
          className={dangerBtnClass}
          disabled={pending}
          onClick={() => {
            if (window.confirm("Delete this review for good?")) act(() => deleteReviewAction(id, slug));
          }}
        >
          Delete
        </button>
      </div>
      {error ? <p className="text-[11px] text-red-700">{error}</p> : null}
    </div>
  );
}
