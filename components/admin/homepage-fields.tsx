"use client";

import { useRef, useState, type ReactNode } from "react";

import { MediaPickButton } from "@/components/admin/media-picker";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-lg border border-[#e4dccf] bg-[#faf7f2] px-3 py-2 text-sm text-[#2b211c] outline-none transition placeholder:text-[#b3a697] focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20";

export function isSafeLink(value: string) {
  const v = value.trim();
  if (v.startsWith("/") && !v.startsWith("//")) return true;
  return /^https?:\/\/[^\s]+$/i.test(v);
}

function titleCase(slug: string) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

/** Plain-language reading of a link so editors can see where it goes. */
export function describeLink(href: string) {
  const v = href.trim();
  if (!v) return "Enter a page path like /shop";
  if (/^https?:\/\//i.test(v)) {
    try {
      return `External site · ${new URL(v).hostname}`;
    } catch {
      return "This link doesn't look right";
    }
  }
  if (!isSafeLink(v)) return "Start with / for a page on your site, or https:// for another site";
  const url = new URL(v, "http://local");
  const parts = url.pathname.split("/").filter(Boolean);
  const q = url.searchParams.get("q");
  if (parts.length === 0) return "Homepage";
  if (parts[0] === "search") return q ? `Search results for “${q}”` : "Search page";
  if (parts[0] === "shop") return url.searchParams.get("sort") === "featured" ? "Shop · featured pieces first" : "Shop · all products";
  if (parts[0] === "category" && parts[1]) return `Category · ${titleCase(parts[1])}`;
  return `Page · /${parts.join("/")}`;
}

export function Card({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e4dccf] bg-white p-5 shadow-[0_1px_2px_rgba(43,33,28,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-[1.35rem] leading-tight font-normal text-[#2b211c]">{title}</h2>
          {description ? <p className="mt-1 text-[13px] leading-relaxed text-[#8a7b6e]">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  id,
  label,
  value,
  onChange,
  max,
  help,
  multiline = false,
  optional = false,
  rows = 3,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  help?: string;
  multiline?: boolean;
  optional?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  const length = value.length;
  const missing = !optional && value.trim() === "";
  const over = length > max;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-[#2b211c]">
          {label}
        </label>
        <span className={cn("text-[11px] tabular-nums text-[#8a7b6e]", over && "font-medium text-red-700")}>
          {optional && length === 0 ? "Optional" : `${length}/${max}`}
        </span>
      </div>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "resize-y leading-relaxed", (missing || over) && "border-red-300")}
        />
      ) : (
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "h-10", (missing || over) && "border-red-300")}
        />
      )}
      {missing ? (
        <p className="mt-1 text-[11px] text-red-700">This field is required.</p>
      ) : over ? (
        <p className="mt-1 text-[11px] text-red-700">Too long — keep it under {max} characters.</p>
      ) : help ? (
        <p className="mt-1 text-[11px] leading-relaxed text-[#8a7b6e]">{help}</p>
      ) : null}
    </div>
  );
}

export function LinkField({
  id,
  label = "Goes to",
  value,
  onChange,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const ok = isSafeLink(value);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-[#2b211c]">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder="/shop"
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "h-10 font-mono text-[12.5px]", !ok && "border-red-300")}
      />
      <p className={cn("mt-1 text-[11px]", ok ? "text-[#8a7b6e]" : "text-red-700")}>
        {ok ? "→ " : ""}
        {describeLink(value)}
      </p>
    </div>
  );
}

type ImageResult = { src: string; ok: boolean; width: number };

export function ImageField({
  id,
  url,
  alt,
  onUrl,
  onAlt,
  help,
  showAlt = true,
  optional = false,
  altOptional = false,
}: {
  id: string;
  url: string;
  alt: string;
  onUrl: (value: string) => void;
  onAlt?: (value: string) => void;
  help?: string;
  /** Some fields (category circles, share image) have nowhere to store a description. */
  showAlt?: boolean;
  /** Empty is allowed: say so quietly instead of in red. */
  optional?: boolean;
  altOptional?: boolean;
}) {
  const [result, setResult] = useState<ImageResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const valid = isSafeLink(url);
  const status = !url.trim()
    ? "empty"
    : !valid
      ? "invalid"
      : result?.src === url
        ? result.ok
          ? "ok"
          : "broken"
        : "loading";

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 rounded-xl border border-dashed p-3",
          status === "broken" || status === "invalid" ? "border-red-300 bg-red-50/40" : "border-[#d4c7b3] bg-[#faf7f2]",
        )}
      >
        <div className="relative h-[84px] w-[112px] shrink-0 overflow-hidden rounded-lg bg-[#efe6d8]">
          {valid ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              onLoad={(event) => setResult({ src: url, ok: true, width: event.currentTarget.naturalWidth })}
              onError={() => setResult({ src: url, ok: false, width: 0 })}
              className={cn("h-full w-full object-cover", status !== "ok" && "opacity-0")}
            />
          ) : null}
          {status !== "ok" ? (
            <span className="absolute inset-0 grid place-items-center px-2 text-center text-[10px] tracking-[0.12em] text-[#8a7b6e] uppercase">
              {status === "loading" ? "Loading" : "No image"}
            </span>
          ) : null}
        </div>
        <div className="min-w-[220px] flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor={id} className="text-[13px] font-medium text-[#2b211c]">
              Image
            </label>
            <span className="text-[11px] text-[#8a7b6e]">Choose from Media, or paste a link</span>
          </div>
          <input
            ref={inputRef}
            id={id}
            value={url}
            placeholder="https://images.unsplash.com/…"
            onChange={(event) => onUrl(event.target.value.trim())}
            onFocus={(event) => event.currentTarget.select()}
            className={cn(inputClass, "h-10 bg-white text-[12.5px]")}
          />
          <p
            className={cn(
              "mt-1 text-[11px]",
              status === "ok" && "text-[#5f7d4e]",
              (status === "broken" || status === "invalid" || (status === "empty" && !optional)) && "text-red-700",
              status === "empty" && optional && "text-[#8a7b6e]",
              status === "loading" && "text-[#8a7b6e]",
            )}
          >
            {status === "ok" && `✓ Image loaded · ${result?.width ?? 0}px wide`}
            {status === "loading" && "Checking image…"}
            {status === "broken" && "✕ This image couldn't be loaded. Check the link is public."}
            {status === "invalid" && "✕ Use a link starting with https:// or /"}
            {status === "empty" && (optional ? "No image — optional." : "Add an image link.")}
          </p>
        </div>
        <MediaPickButton
          className="shrink-0"
          onPick={(pickedUrl, pickedAlt) => {
            onUrl(pickedUrl);
            if (pickedAlt && !alt.trim()) onAlt?.(pickedAlt);
          }}
        />
      </div>
      {help ? <p className="-mt-2 text-[11px] text-[#8a7b6e]">{help}</p> : null}
      {showAlt && onAlt ? (
      <Field
        id={`${id}-alt`}
        label="Describe the image"
        value={alt}
        optional={altOptional}
        onChange={onAlt}
        max={180}
        help="A short description for screen readers and Google, e.g. “Woman in an ivory embroidered suit”."
      />
      ) : null}
    </div>
  );
}

export function ItemCards<T>({
  items,
  noun,
  min = 1,
  max,
  selected,
  onSelect,
  onChange,
  createItem,
  getTitle,
  getSubtitle,
  getImage,
  renderBody,
  columns = 3,
}: {
  items: T[];
  noun: string;
  min?: number;
  max: number;
  selected?: number;
  onSelect?: (index: number) => void;
  onChange: (items: T[], nextSelected?: number) => void;
  createItem: () => T;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getImage?: (item: T) => string;
  renderBody?: (item: T, index: number) => ReactNode;
  columns?: 2 | 3;
}) {
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next, selected === index ? target : selected === target ? index : selected);
  }

  function remove(index: number) {
    const next = items.filter((_, i) => i !== index);
    const sel = selected === undefined ? undefined : Math.max(0, Math.min(selected > index ? selected - 1 : selected, next.length - 1));
    onChange(next, sel);
  }

  const toolClass =
    "grid h-6 min-w-6 place-items-center rounded-md bg-white/95 px-1.5 text-[11px] text-[#2b211c] shadow-sm hover:bg-white disabled:opacity-35";

  return (
    <div>
      <div className={cn("grid gap-3", columns === 3 ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2")}>
        {items.map((item, index) => {
          const active = selected === index;
          const tools = (
            <div className="flex gap-1">
              <button type="button" aria-label={`Move ${noun} ${index + 1} earlier`} className={toolClass} disabled={index === 0} onClick={(e) => { e.stopPropagation(); move(index, -1); }}>
                ←
              </button>
              <button type="button" aria-label={`Move ${noun} ${index + 1} later`} className={toolClass} disabled={index === items.length - 1} onClick={(e) => { e.stopPropagation(); move(index, 1); }}>
                →
              </button>
              <button type="button" aria-label={`Remove ${noun} ${index + 1}`} className={cn(toolClass, "hover:text-red-700")} disabled={items.length <= min} onClick={(e) => { e.stopPropagation(); remove(index); }}>
                ✕
              </button>
            </div>
          );
          return (
            <div
              key={index}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={onSelect ? () => onSelect(index) : undefined}
              onKeyDown={onSelect ? (e) => { if (e.key === "Enter") onSelect(index); } : undefined}
              className={cn(
                "overflow-hidden rounded-xl border bg-white text-left transition",
                onSelect && "cursor-pointer hover:border-[#b08d57]/60",
                active ? "border-[#b08d57] ring-2 ring-[#b08d57]/25" : "border-[#e4dccf]",
              )}
            >
              {getImage ? (
                <div className="relative h-32 bg-[#efe6d8]">
                  {isSafeLink(getImage(item)) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getImage(item)} alt="" className="h-full w-full object-cover" />
                  ) : null}
                  <span className="absolute top-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-[11px] text-[#8a7b6e] shadow-sm">{index + 1}</span>
                  <div className="absolute top-2 right-2">{tools}</div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-[#efe6d8] bg-[#faf7f2] px-3 py-2">
                  <span className="text-[11px] tracking-[0.14em] text-[#8a7b6e] uppercase">
                    {noun} {index + 1}
                  </span>
                  {tools}
                </div>
              )}
              <div className="p-3">
                {renderBody ? (
                  renderBody(item, index)
                ) : (
                  <>
                    <p className="truncate font-serif text-[1.05rem] text-[#2b211c]">{getTitle(item) || "Untitled"}</p>
                    {getSubtitle ? <p className="mt-0.5 truncate text-[11px] text-[#8a7b6e]">{getSubtitle(item)}</p> : null}
                    {onSelect ? <p className="mt-2 text-[11px] font-medium text-[#b08d57]">{active ? "Editing below ↓" : "Click to edit"}</p> : null}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={items.length >= max}
          onClick={() => onChange([...items, createItem()], items.length)}
          className="rounded-lg border border-[#e4dccf] bg-white px-3.5 py-2 text-xs font-medium text-[#2b211c] hover:border-[#b08d57] disabled:opacity-40"
        >
          + Add {noun}
        </button>
        <span className="text-[11px] text-[#8a7b6e]">
          {items.length} of {max} used
        </span>
      </div>
    </div>
  );
}
