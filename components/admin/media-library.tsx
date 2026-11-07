"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Notice, btnClass, dangerBtnClass, primaryBtnClass } from "@/components/admin/admin-ui";
import { inputClass } from "@/components/admin/homepage-fields";
import {
  addMediaLinkAction,
  deleteMediaAction,
  listMediaAction,
  mediaUsageAction,
  updateMediaAltAction,
  type MediaAsset,
  type MediaUsage,
} from "@/lib/admin/media";
import { cn } from "@/lib/utils";

const NO_KEYS =
  "Uploads need Cloudinary keys. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to apps/api/.env and restart the API. Until then, paste image links below — they work everywhere.";

type Upload = { name: string; progress: number; error?: string };

function sizeLabel(asset: MediaAsset) {
  const parts = [];
  if (asset.width && asset.height) parts.push(`${asset.width} × ${asset.height}`);
  if (asset.bytes) parts.push(`${Math.round(asset.bytes / 1024)} KB`);
  parts.push(asset.source === "cloudinary" ? "Cloudinary" : "Linked image");
  return parts.join(" · ");
}

/**
 * The media library. As a page it manages images; in `pick` mode (inside the
 * picker dialog) the detail panel's main button hands the chosen image back.
 */
export function MediaLibrary({ onPick, compact = false }: { onPick?: (asset: MediaAsset) => void; compact?: boolean }) {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [configured, setConfigured] = useState(true);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [usage, setUsage] = useState<MediaUsage | null>(null);
  const [alt, setAlt] = useState("");
  const [link, setLink] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (q: string, src: string) => {
    setLoading(true);
    const res = await listMediaAction(q, src);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setItems(res.data.items);
    setTotal(res.data.total);
    setConfigured(res.data.cloudinaryConfigured);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(search, source), search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [search, source, load]);

  function select(asset: MediaAsset | null) {
    setSelected(asset);
    setUsage(null);
    setCopied(false);
    if (!asset) return;
    setAlt(asset.alt);
    void mediaUsageAction(asset.id).then((res) => setUsage(res.ok ? res.data : []));
  }

  function uploadFiles(files: FileList | File[]) {
    if (!configured) {
      setError(NO_KEYS);
      return;
    }
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setUploads((u) => [...u, { name: file.name, progress: 100, error: "Not an image" }]);
        continue;
      }
      const entry: Upload = { name: file.name, progress: 0 };
      setUploads((u) => [...u, entry]);
      const form = new FormData();
      form.set("file", file);
      form.set("alt", file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "));
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/admin/api/media-upload");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploads((u) => u.map((x) => (x.name === file.name ? { ...x, progress: Math.round((e.loaded / e.total) * 100) } : x)));
      };
      xhr.onload = () => {
        let message = "Upload failed";
        try {
          message = JSON.parse(xhr.responseText).message ?? message;
        } catch {}
        const ok = xhr.status >= 200 && xhr.status < 300;
        setUploads((u) => u.map((x) => (x.name === file.name ? { ...x, progress: 100, error: ok ? undefined : message } : x)));
        if (ok) void load(search, source);
      };
      xhr.onerror = () => setUploads((u) => u.map((x) => (x.name === file.name ? { ...x, progress: 100, error: "Network error" } : x)));
      xhr.send(form);
    }
  }

  async function addLink() {
    setError(null);
    const res = await addMediaLinkAction(link.trim());
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setLink("");
    await load(search, source);
    select(res.data);
  }

  async function saveAlt() {
    if (!selected) return;
    const res = await updateMediaAltAction(selected.id, alt);
    if (!res.ok) return setError(res.error);
    setSelected(res.data);
    setItems((list) => list.map((i) => (i.id === res.data.id ? res.data : i)));
  }

  async function remove() {
    if (!selected) return;
    const used = usage?.length ? `\n\nIt's used in: ${usage.map((u) => u.label).join(", ")}. Those places will show a broken image if the file is removed from Cloudinary.` : "";
    if (!window.confirm(`Delete ${selected.filename || "this image"} from the library?${used}`)) return;
    const res = await deleteMediaAction(selected.id);
    if (!res.ok) return setError(res.error);
    select(null);
    await load(search, source);
  }

  return (
    <div className={cn("grid gap-5", selected ? (compact ? "lg:grid-cols-[minmax(0,1fr)_280px]" : "xl:grid-cols-[minmax(0,1fr)_320px]") : "")}>
      <div className="min-w-0 space-y-4">
        {!configured ? <Notice tone="warn">{NO_KEYS}</Notice> : null}
        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {error}
          </p>
        ) : null}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            uploadFiles(e.dataTransfer.files);
          }}
          className={cn(
            "rounded-xl border border-dashed p-5 text-center transition",
            drag ? "border-[#b08d57] bg-[#f7efe2]" : "border-[#d4c7b3] bg-[#faf7f2]",
            !configured && "opacity-70",
          )}
        >
          <p className="font-serif text-xl text-[#2b211c]">Drop images here to upload</p>
          <p className="mt-1 text-[12px] text-[#8a7b6e]">JPG, PNG or WebP up to 10 MB · resized to 1200px and stored on Cloudinary</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button type="button" className={btnClass} disabled={!configured} onClick={() => fileRef.current?.click()}>
              Choose files
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
          </div>
          <div className="mx-auto mt-3 flex max-w-xl flex-wrap items-center gap-2">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addLink();
                }
              }}
              placeholder="…or paste an image link (https://…)"
              aria-label="Image link"
              className={cn(inputClass, "h-9 flex-1 bg-white text-[12.5px]")}
            />
            <button type="button" className={btnClass} disabled={!link.trim()} onClick={() => void addLink()}>
              Add link
            </button>
          </div>
          {uploads.length ? (
            <ul className="mx-auto mt-3 max-w-xl space-y-1.5 text-left">
              {uploads.map((u) => (
                <li key={u.name} className="text-[11px]">
                  <div className="flex justify-between">
                    <span className="truncate">{u.name}</span>
                    <span className={u.error ? "text-red-700" : "text-[#8a7b6e]"}>{u.error ?? `${u.progress}%`}</span>
                  </div>
                  <div className="mt-0.5 h-1 overflow-hidden rounded bg-[#e9e2d6]">
                    <div className={cn("h-full", u.error ? "bg-red-400" : "bg-[#b08d57]")} style={{ width: `${u.progress}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or description" aria-label="Search images" className={cn(inputClass, "h-9 max-w-sm flex-1 bg-white")} />
          <select value={source} onChange={(e) => setSource(e.target.value)} aria-label="Image source" className={cn(inputClass, "h-9 w-40 bg-white")}>
            <option value="">All images</option>
            <option value="cloudinary">Uploaded</option>
            <option value="link">Linked</option>
          </select>
          <span className="ml-auto text-[11px] text-[#8a7b6e]">{loading ? "Loading…" : `${total} image${total === 1 ? "" : "s"}`}</span>
        </div>

        {!loading && items.length === 0 ? (
          <Notice>{search ? "No images match that search." : "The library is empty. Upload an image or paste a link above."}</Notice>
        ) : (
          <div className={cn("grid gap-3", compact ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6")}>
            {items.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => select(asset)}
                onDoubleClick={() => onPick?.(asset)}
                className={cn(
                  "overflow-hidden rounded-xl border bg-white text-left transition hover:border-[#b08d57]/60",
                  selected?.id === asset.id ? "border-[#b08d57] ring-2 ring-[#b08d57]/25" : "border-[#e4dccf]",
                )}
              >
                <div className="aspect-square bg-[#efe6d8]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
                <p className="truncate px-2 py-1.5 text-[11px] text-[#6f6155]">{asset.filename || asset.alt || "Image"}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected ? (
        <aside className="space-y-4 self-start rounded-xl border border-[#e4dccf] bg-white p-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-[0.16em] text-[#8a7b6e] uppercase">Selected image</p>
            <button type="button" aria-label="Close details" onClick={() => select(null)} className="text-[#8a7b6e] hover:text-[#2b211c]">
              ✕
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selected.url} alt="" className="max-h-64 w-full rounded-lg bg-[#efe6d8] object-contain" />
          <div>
            <p className="truncate text-[13px] font-medium text-[#2b211c]">{selected.filename || "Image"}</p>
            <p className="text-[11px] text-[#8a7b6e]">{sizeLabel(selected)}</p>
          </div>
          <div>
            <label htmlFor="media-alt" className="mb-1.5 block text-[13px] font-medium text-[#2b211c]">
              Describe the image
            </label>
            <textarea id="media-alt" rows={2} value={alt} onChange={(e) => setAlt(e.target.value)} className={cn(inputClass, "resize-y")} />
            {alt !== selected.alt ? (
              <button type="button" className={cn(btnClass, "mt-2")} onClick={() => void saveAlt()}>
                Save description
              </button>
            ) : null}
          </div>
          <div>
            <p className="mb-1 text-[13px] font-medium text-[#2b211c]">Used in</p>
            {usage === null ? (
              <p className="text-[11px] text-[#8a7b6e]">Checking…</p>
            ) : usage.length === 0 ? (
              <p className="text-[11px] text-[#8a7b6e]">Not used anywhere yet.</p>
            ) : (
              <ul className="space-y-0.5 text-[12px]">
                {usage.map((u, i) => (
                  <li key={`${u.label}-${i}`}>
                    <Link href={u.href} className="text-[#7a5c2e] hover:underline">
                      {u.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-[#efe6d8] pt-3">
            <button type="button" className={dangerBtnClass} onClick={() => void remove()}>
              Delete
            </button>
            <button
              type="button"
              className={btnClass}
              onClick={() => {
                void navigator.clipboard?.writeText(selected.url);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            {onPick ? (
              <button type="button" className={cn(primaryBtnClass, "ml-auto")} onClick={() => onPick({ ...selected, alt })}>
                Use this image
              </button>
            ) : null}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
