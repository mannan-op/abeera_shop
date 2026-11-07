"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminHeader, Notice, Toggle, ToggleRow, btnClass, dangerBtnClass, primaryBtnClass } from "@/components/admin/admin-ui";
import { Field, ImageField } from "@/components/admin/homepage-fields";
import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  updateCategoryAction,
  type AdminCategory,
} from "@/lib/admin/categories";
import { cn, slugify } from "@/lib/utils";

type Draft = { id?: string; name: string; slug: string; description: string; image: string; imageAlt: string; showInShop: boolean };

const BUILT_IN = [
  { name: "All", slug: "shop", note: "Always first · every product" },
  { name: "New Arrivals", slug: "category/new-arrivals", note: "Built-in · always shown after All" },
  { name: "Sale", slug: "category/sale", note: "Built-in · always shown after New Arrivals" },
];

function toDraft(c?: AdminCategory): Draft {
  return {
    id: c?.id,
    name: c?.name ?? "",
    slug: c?.slug ?? "",
    description: c?.description ?? "",
    image: c?.image ?? "",
    imageAlt: c?.name ?? "",
    showInShop: c?.showInShop ?? true,
  };
}

export function CategoriesManager({ initial }: { initial: AdminCategory[] }) {
  const [rows, setRows] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [original, setOriginal] = useState<Draft | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!draft) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDraft(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);

  function open(c?: AdminCategory) {
    const d = toDraft(c);
    setDraft(d);
    setOriginal(d);
    setSlugTouched(Boolean(c));
    setMessage(null);
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    const res = await reorderCategoriesAction(next.map((r) => r.id));
    if (!res.ok) {
      setRows(rows);
      setMessage({ tone: "error", text: res.error });
    } else {
      setRows(res.data);
      setMessage({ tone: "ok", text: "Order saved. The shop circles follow it." });
    }
  }

  async function toggleShow(row: AdminCategory, value: boolean) {
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, showInShop: value } : r)));
    const res = await updateCategoryAction(row.id, { showInShop: value });
    if (!res.ok) {
      setRows((list) => list.map((r) => (r.id === row.id ? row : r)));
      setMessage({ tone: "error", text: res.error });
    } else {
      setMessage({ tone: "ok", text: `${row.name} is now ${value ? "shown" : "hidden"} in the shop circles.` });
    }
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    const input = {
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description,
      image: draft.image.trim() || null,
      showInShop: draft.showInShop,
    };
    const res = draft.id ? await updateCategoryAction(draft.id, input) : await createCategoryAction(input);
    setBusy(false);
    if (!res.ok) {
      setMessage({ tone: "error", text: res.error });
      return;
    }
    const saved = res.data;
    setRows((list) =>
      draft.id
        ? list.map((r) => (r.id === saved.id ? { ...r, ...saved } : r))
        : [...list, { ...saved, productCount: 0 }],
    );
    setDraft(null);
    setMessage({ tone: "ok", text: `${saved.name} saved.` });
  }

  async function remove() {
    if (!draft?.id) return;
    if (!window.confirm(`Delete the ${draft.name} category? This can't be undone.`)) return;
    setBusy(true);
    const res = await deleteCategoryAction(draft.id);
    setBusy(false);
    if (!res.ok) {
      setMessage({ tone: "error", text: res.error });
      return;
    }
    setRows((list) => list.filter((r) => r.id !== draft.id));
    setMessage({ tone: "ok", text: `${draft.name} deleted.` });
    setDraft(null);
  }

  const dirty = draft && original && JSON.stringify(draft) !== JSON.stringify(original);
  const current = draft?.id ? rows.find((r) => r.id === draft.id) : undefined;

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Catalog" }, { label: "Categories" }]}
        title="Categories"
        description="The circles at the top of the Shop page and the category pages. Use the arrows to reorder; changes save straight away."
        action={
          <>
            <Link href="/shop" target="_blank" className={btnClass}>
              View shop ↗
            </Link>
            <button type="button" className={primaryBtnClass} onClick={() => open()}>
              + New category
            </button>
          </>
        }
      />

      {message ? (
        <p role="status" className={cn("mb-4 rounded-lg px-3 py-2 text-[13px]", message.tone === "error" ? "bg-red-50 text-red-700" : "bg-[#eef3e8] text-[#4d6a3d]")}>
          {message.text}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#e4dccf] bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-[#faf7f2] text-left text-[10px] tracking-[0.12em] text-[#8a7b6e] uppercase">
            <tr>
              <th className="w-20 px-4 py-2.5 font-medium">Order</th>
              <th className="px-2 py-2.5 font-medium">Category</th>
              <th className="px-2 py-2.5 font-medium">Link</th>
              <th className="px-2 py-2.5 font-medium">Products</th>
              <th className="px-2 py-2.5 font-medium">Show in shop circles</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {BUILT_IN.map((b) => (
              <BuiltInRow key={b.slug} {...b} />
            ))}
            {rows.map((row, i) => (
              <tr key={row.id} className={cn("border-t border-[#efe6d8]", draft?.id === row.id && "bg-[#fbf7f0]")}>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <button type="button" aria-label={`Move ${row.name} up`} disabled={i === 0} onClick={() => void move(i, -1)} className="grid h-7 w-7 place-items-center rounded-md border border-[#e4dccf] text-[11px] disabled:opacity-30">↑</button>
                    <button type="button" aria-label={`Move ${row.name} down`} disabled={i === rows.length - 1} onClick={() => void move(i, 1)} className="grid h-7 w-7 place-items-center rounded-md border border-[#e4dccf] text-[11px] disabled:opacity-30">↓</button>
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="block h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#efe6d8] shadow">
                      {row.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.image} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-[#2b211c]">{row.name}</p>
                      <p className="truncate text-[11px] text-[#8a7b6e]">{row.image ? row.description || "—" : "No image · the shop uses its first product photo"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2.5 font-mono text-[12px] text-[#6f6155]">/category/{row.slug}</td>
                <td className="px-2 py-2.5 tabular-nums">{row.productCount}</td>
                <td className="px-2 py-2.5">
                  <Toggle checked={row.showInShop} onChange={(v) => void toggleShow(row, v)} label={`Show ${row.name} in shop circles`} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button type="button" className={btnClass} onClick={() => open(row)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-[#8a7b6e]">New Arrivals and Sale are built-in views, so they can&apos;t be edited or reordered here. On the Shop page the circles show All, New Arrivals and Sale first, then your categories in this order.</p>

      {draft ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-[#1a1613]/30" onClick={() => setDraft(null)}>
          <div role="dialog" aria-modal="true" aria-label={draft.id ? `Edit ${original?.name}` : "New category"} className="flex h-full w-full max-w-[480px] flex-col bg-[#f6f1e9] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-[#e4dccf] px-6 py-4">
              <div>
                <p className="text-[10px] tracking-[0.16em] text-[#8a7b6e] uppercase">{draft.id ? "Edit category" : "New category"}</p>
                <p className="font-serif text-2xl text-[#2b211c]">{draft.name || "Untitled"}</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setDraft(null)} className="text-[#8a7b6e] hover:text-[#2b211c]">✕</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <ImageField
                id="cat-image"
                url={draft.image}
                alt={draft.imageAlt}
                onUrl={(v) => setDraft({ ...draft, image: v })}
                showAlt={false}
                optional
                help="Shown in the round circle on the Shop page. Leave empty to use the first product photo."
              />
              <Field id="cat-name" label="Name" max={60} value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, slug: slugTouched ? draft.slug : slugify(v) })} />
              <div>
                <label htmlFor="cat-slug" className="mb-1.5 block text-[13px] font-medium text-[#2b211c]">Link name</label>
                <div className="flex items-center rounded-lg border border-[#e4dccf] bg-[#faf7f2] pl-3 text-[12px] text-[#8a7b6e] focus-within:border-[#b08d57]">
                  /category/
                  <input
                    id="cat-slug"
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                    }}
                    className="h-10 min-w-0 flex-1 bg-transparent pr-3 font-mono text-[12.5px] text-[#2b211c] outline-none"
                  />
                </div>
                {draft.id && original && draft.slug !== original.slug ? (
                  <p className="mt-1 text-[11px] text-[#9a6b1f]">Changing this breaks old links to the category page — and menu links that point to it.</p>
                ) : null}
              </div>
              <Field id="cat-desc" label="Description" max={400} optional multiline rows={3} value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} help="Shown at the top of the category page." />
              <ToggleRow label="Show in shop circles" help="Hidden categories still have their own page." checked={draft.showInShop} onChange={(v) => setDraft({ ...draft, showInShop: v })} />
              {current && current.productCount > 0 ? <Notice>{current.productCount} products are in this category. Move them before deleting it.</Notice> : null}
            </div>
            <div className="flex items-center gap-2 border-t border-[#e4dccf] bg-white px-6 py-3">
              {draft.id ? (
                <button type="button" className={dangerBtnClass} disabled={busy} onClick={() => void remove()}>
                  Delete
                </button>
              ) : null}
              <span className="flex-1" />
              <button type="button" className={btnClass} onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button type="button" className={primaryBtnClass} disabled={busy || !dirty || !draft.name.trim() || !draft.slug.trim()} onClick={() => void save()}>
                {busy ? "Saving…" : draft.id ? "Save category" : "Create category"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BuiltInRow({ name, slug, note }: { name: string; slug: string; note: string }) {
  return (
    <tr className="border-t border-[#efe6d8] bg-[#fcfaf6] text-[#8a7b6e]">
      <td className="px-4 py-2.5 text-[11px]">—</td>
      <td className="px-2 py-2.5">
        <p className="font-medium">{name}</p>
        <p className="text-[11px]">{note}</p>
      </td>
      <td className="px-2 py-2.5 font-mono text-[12px]">/{slug}</td>
      <td className="px-2 py-2.5">—</td>
      <td className="px-2 py-2.5 text-[11px]">Always shown</td>
      <td />
    </tr>
  );
}
