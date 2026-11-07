"use client";

import { useEffect, useState } from "react";

import { btnClass } from "@/components/admin/admin-ui";
import { MediaLibrary } from "@/components/admin/media-library";
import { cn } from "@/lib/utils";

/** Opens the media library in a dialog and returns the chosen image. */
export function MediaPickButton({
  onPick,
  label = "Choose from Media",
  className,
}: {
  onPick: (url: string, alt: string) => void;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" className={cn(btnClass, className)} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1613]/50 p-6" role="dialog" aria-modal="true" aria-label="Choose an image">
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#f6f1e9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e4dccf] px-5 py-3">
              <div>
                <p className="font-serif text-2xl text-[#2b211c]">Choose an image</p>
                <p className="text-[12px] text-[#8a7b6e]">Click an image, then “Use this image”. Double-click to use it straight away.</p>
              </div>
              <button type="button" className={btnClass} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              <MediaLibrary
                compact
                onPick={(asset) => {
                  onPick(asset.url, asset.alt);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
