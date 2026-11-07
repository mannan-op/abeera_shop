"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const btnClass =
  "rounded-lg border border-[#e4dccf] bg-white px-3.5 py-2 text-xs font-medium text-[#2b211c] transition hover:border-[#b08d57] disabled:opacity-40";
export const primaryBtnClass =
  "rounded-lg bg-[#2b211c] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#3d312a] disabled:opacity-40";
export const dangerBtnClass =
  "rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-red-700 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-40";

export function AdminHeader({
  crumbs,
  title,
  description,
  action,
}: {
  crumbs: { label: string; href?: string }[];
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] tracking-[0.14em] text-[#8a7b6e] uppercase">
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {i > 0 ? " / " : ""}
              {c.href ? (
                <Link href={c.href} className="hover:text-[#2b211c]">
                  {c.label}
                </Link>
              ) : (
                c.label
              )}
            </span>
          ))}
        </p>
        <h1 className="mt-1 font-serif text-[2rem] leading-tight text-[#2b211c]">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-[13px] text-[#8a7b6e]">{description}</p> : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition disabled:opacity-40",
        checked ? "bg-[#2b211c]" : "bg-[#d9cfc0]",
      )}
    >
      <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

export function ToggleRow({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[13px] font-medium text-[#2b211c]">{label}</p>
        {help ? <p className="text-[11px] text-[#8a7b6e]">{help}</p> : null}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export type SaveTone = "idle" | "saved" | "error";

export function SaveBar({
  dirtyLabels,
  message,
  tone,
  pending,
  onDiscard,
  onSave,
  saveLabel = "Save & publish",
  extra,
}: {
  dirtyLabels: string[];
  message?: string;
  tone: SaveTone;
  pending: boolean;
  onDiscard?: () => void;
  onSave: () => void;
  saveLabel?: string;
  extra?: ReactNode;
}) {
  const dirty = dirtyLabels.length > 0;
  return (
    <div className="sticky bottom-0 z-20 mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-[#e4dccf] bg-white/95 px-5 py-3 shadow-[0_8px_30px_rgba(43,33,28,0.12)] backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 text-[13px]" aria-live="polite">
        {tone === "error" && message ? (
          <span className="text-red-700">{message}</span>
        ) : dirty ? (
          <>
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#b08d57]" />
            <b className="font-medium">Unsaved changes</b>
            <span className="truncate text-[#8a7b6e]">· {dirtyLabels.join(", ")}</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#9bb38a]" />
            <span className="text-[#8a7b6e]">{message || "All changes saved."}</span>
          </>
        )}
      </div>
      {extra}
      {onDiscard ? (
        <button type="button" className={cn(btnClass, "border-transparent bg-transparent text-[#8a7b6e]")} onClick={onDiscard} disabled={!dirty || pending}>
          Discard
        </button>
      ) : null}
      <button type="button" onClick={onSave} disabled={pending || !dirty} className={primaryBtnClass}>
        {pending ? "Saving…" : saveLabel}
      </button>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-[13px] leading-relaxed",
        tone === "warn" ? "border-[#e8d3a8] bg-[#fbf3e2] text-[#6b5326]" : "border-[#e4dccf] bg-[#faf7f2] text-[#6f6155]",
      )}
    >
      {children}
    </div>
  );
}

