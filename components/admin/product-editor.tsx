"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";

import { AdminHeader, Notice, SaveBar, ToggleRow, Toggle, btnClass, dangerBtnClass } from "@/components/admin/admin-ui";
import { Card, Field, inputClass, isSafeLink } from "@/components/admin/homepage-fields";
import { MediaPickButton } from "@/components/admin/media-picker";
import { saveProductAction, type ProductSaveState } from "@/lib/admin/actions";
import { type EditorImage, type EditorProduct, type EditorVariant } from "@/lib/admin/product-model";
import { cn, slugify } from "@/lib/utils";

const SIZE_CHOICES = ["XS", "S", "M", "L", "XL", "XXL", "Free size"];

const toPaisa = (value: string) => Math.round(Number(value) * 100);

function variantProblem(v: EditorVariant, all: EditorVariant[]): string | null {
  if (!v.color.trim()) return "Add a colour name";
  if (!v.size.trim()) return "Add a size";
  const price = Number(v.price);
  if (!v.price.trim() || !Number.isFinite(price) || price <= 0) return "Price must be more than 0";
  if (v.sale.trim()) {
    const sale = Number(v.sale);
    if (!Number.isFinite(sale) || sale <= 0) return "Sale price must be more than 0";
    if (sale >= price) return "Sale price must be lower than the price";
  }
  const stock = Number(v.stock || 0);
  if (!Number.isInteger(stock) || stock < 0) return "Stock must be 0 or more";
  const key = `${v.color.trim().toLowerCase()}|${v.size.trim().toLowerCase()}`;
  if (all.filter((o) => `${o.color.trim().toLowerCase()}|${o.size.trim().toLowerCase()}` === key).length > 1) {
    return "This colour and size appear twice";
  }
  return null;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const idle: ProductSaveState = { status: "idle", message: "" };

export function ProductEditor({
  initial,
  categories,
}: {
  initial: EditorProduct;
  categories: { id: string; name: string }[];
}) {
  const [p, setP] = useState<EditorProduct>(initial);
  const [baseline, setBaseline] = useState<EditorProduct>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [newUrl, setNewUrl] = useState("");
  const [bulkColor, setBulkColor] = useState("");
  const [bulkHex, setBulkHex] = useState("#c9b79c");
  const [bulkSizes, setBulkSizes] = useState<string[]>(["S", "M", "L"]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(saveProductAction, idle);
  const submitted = useRef<EditorProduct | null>(null);

  useEffect(() => {
    if (state.status === "saved" && submitted.current) {
      setBaseline(submitted.current);
      submitted.current = null;
    }
  }, [state]);

  const groups: [string, (keyof EditorProduct)[]][] = [
    ["Basics", ["name", "slug", "categoryId", "isNew", "isBestSeller"]],
    ["Photos", ["images"]],
    ["Sizes & stock", ["variants"]],
    ["Description", ["tagline", "description", "details", "materials", "care"]],
  ];
  const dirtyLabels = groups.filter(([, keys]) => keys.some((k) => !same(p[k], baseline[k]))).map(([l]) => l);
  const dirty = dirtyLabels.length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const problems = useMemo(() => p.variants.map((v) => variantProblem(v, p.variants)), [p.variants]);
  const totalStock = p.variants.reduce((n, v) => n + (v.soldOut ? 0 : Number(v.stock) || 0), 0);
  const colours = [...new Set(p.variants.map((v) => v.color.trim()).filter(Boolean))];
  const lowStock = p.variants.filter((v) => !v.soldOut && (Number(v.stock) || 0) > 0 && Number(v.stock) <= 2).length;
  const outOfStock = p.variants.filter((v) => v.soldOut || (Number(v.stock) || 0) === 0).length;

  function set<K extends keyof EditorProduct>(key: K, value: EditorProduct[K]) {
    setP((c) => ({ ...c, [key]: value }));
  }
  function setVariant(index: number, value: Partial<EditorVariant>) {
    setP((c) => ({ ...c, variants: c.variants.map((v, i) => (i === index ? { ...v, ...value } : v)) }));
  }
  function setImages(images: EditorImage[]) {
    setP((c) => ({ ...c, images }));
  }
  function moveImage(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= p.images.length) return;
    const next = [...p.images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
  }
  function addImage(url: string, alt = "") {
    const clean = url.trim();
    if (!isSafeLink(clean)) {
      setClientError("Photo links must start with https:// or /.");
      return;
    }
    setClientError(null);
    setImages([...p.images, { url: clean, alt: alt || p.name }]);
    setNewUrl("");
  }
  function addRows() {
    const color = bulkColor.trim();
    if (!color || bulkSizes.length === 0) {
      setClientError("Type a colour name and pick at least one size to add rows.");
      return;
    }
    setClientError(null);
    const template = p.variants[p.variants.length - 1];
    const existing = new Set(p.variants.map((v) => `${v.color.trim().toLowerCase()}|${v.size.trim().toLowerCase()}`));
    const rows = bulkSizes
      .filter((size) => !existing.has(`${color.toLowerCase()}|${size.toLowerCase()}`))
      .map((size) => ({
        color,
        colorHex: bulkHex,
        size,
        price: template?.price ?? "",
        sale: template?.sale ?? "",
        stock: "0",
        soldOut: false,
      }));
    set("variants", [...p.variants, ...rows]);
    setBulkColor("");
  }

  function save() {
    setClientError(null);
    if (!p.name.trim() || !p.slug.trim() || !p.categoryId) {
      setClientError("Name, web address and category are required.");
      return;
    }
    if (p.variants.length === 0) {
      setClientError("Add at least one colour and size.");
      return;
    }
    const firstProblem = problems.findIndex(Boolean);
    if (firstProblem >= 0) {
      setClientError(`Row ${firstProblem + 1}: ${problems[firstProblem]}.`);
      return;
    }
    const bad = p.images.findIndex((img) => !isSafeLink(img.url));
    if (bad >= 0) {
      setClientError(`Photo ${bad + 1} has a link that doesn't look right.`);
      return;
    }
    const body = {
      id: p.id,
      name: p.name.trim(),
      slug: p.slug.trim(),
      tagline: p.tagline,
      description: p.description,
      details: p.details,
      materials: p.materials,
      care: p.care,
      categoryId: p.categoryId,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      images: p.images.map((img) => ({ url: img.url.trim(), alt: img.alt.trim() })),
      variants: p.variants.map((v) => {
        const price = toPaisa(v.price);
        const sale = v.sale.trim() ? toPaisa(v.sale) : null;
        return {
          id: v.id,
          color: v.color.trim(),
          colorHex: v.colorHex,
          size: v.size.trim(),
          priceInPaisa: sale ?? price,
          compareAtPrice: sale ? price : null,
          stock: Number(v.stock || 0),
          soldOut: v.soldOut,
        };
      }),
    };
    submitted.current = p;
    const data = new FormData();
    data.set("document", JSON.stringify(body));
    startTransition(() => formAction(data));
  }

  const tone = clientError || state.status === "error" ? "error" : state.status === "saved" ? "saved" : "idle";
  const message = clientError ?? (state.message || (p.id ? "All changes saved." : "Fill in the details, then create the product."));

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Catalog" }, { label: "Products", href: "/admin/products" }]}
        title={p.id ? baseline.name || "Product" : "New product"}
        description={p.id ? "Photos, sizes, prices and stock for this piece." : "Add photos, then a row for each colour and size you sell."}
        action={
          p.id ? (
            <Link href={`/product/${baseline.slug}`} target="_blank" className={btnClass}>
              View on site ↗
            </Link>
          ) : null
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card title="Photos" description="The first photo is the main one; the second appears on hover in the shop. Drag order with the arrows.">
            {p.images.length ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {p.images.map((img, i) => (
                  <div key={`${img.url}-${i}`} className="overflow-hidden rounded-xl border border-[#e4dccf] bg-white">
                    <div className="relative aspect-[3/4] bg-[#efe6d8]">
                      {isSafeLink(img.url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                      {i < 2 ? (
                        <span className="absolute top-2 left-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-[#2b211c] uppercase shadow-sm">
                          {i === 0 ? "Main" : "Hover"}
                        </span>
                      ) : null}
                      <div className="absolute right-1.5 bottom-1.5 flex gap-1">
                        <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => moveImage(i, -1)} className="grid h-6 w-6 place-items-center rounded-md bg-white/95 text-[11px] shadow-sm disabled:opacity-35">←</button>
                        <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === p.images.length - 1} onClick={() => moveImage(i, 1)} className="grid h-6 w-6 place-items-center rounded-md bg-white/95 text-[11px] shadow-sm disabled:opacity-35">→</button>
                        <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setImages(p.images.filter((_, j) => j !== i))} className="grid h-6 w-6 place-items-center rounded-md bg-white/95 text-[11px] shadow-sm hover:text-red-700">✕</button>
                      </div>
                    </div>
                    <input
                      aria-label={`Description of photo ${i + 1}`}
                      value={img.alt}
                      placeholder="Describe the photo"
                      onChange={(e) => setImages(p.images.map((im, j) => (j === i ? { ...im, alt: e.target.value } : im)))}
                      className="w-full border-t border-[#efe6d8] px-2 py-1.5 text-[11px] text-[#2b211c] outline-none focus:bg-[#faf7f2]"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Notice>No photos yet. The shop shows a placeholder until you add one.</Notice>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <MediaPickButton label="+ Add from Media" onPick={(url, alt) => addImage(url, alt)} />
              <span className="text-[11px] text-[#8a7b6e]">or paste a link</span>
              <input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage(newUrl);
                  }
                }}
                placeholder="https://…"
                aria-label="Photo link"
                className={cn(inputClass, "h-9 max-w-xs flex-1 bg-white text-[12.5px]")}
              />
              <button type="button" className={btnClass} disabled={!newUrl.trim()} onClick={() => addImage(newUrl)}>
                Add
              </button>
              <span className="ml-auto text-[11px] text-[#8a7b6e]">{p.images.length} of 12</span>
            </div>
          </Card>

          <Card title="Sizes, prices & stock" description="One row for each colour and size. Price is the original. Sale price is optional — customers pay that instead, and the original is kept as the compare-at price, shown crossed out.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-[13px]">
                <thead>
                  <tr className="text-left text-[10px] tracking-[0.12em] text-[#8a7b6e] uppercase">
                    <th className="pb-2 font-medium">Colour</th>
                    <th className="pb-2 font-medium">Size</th>
                    <th className="pb-2 font-medium">Price (Rs)</th>
                    <th className="pb-2 font-medium">Sale price (Rs)</th>
                    <th className="pb-2 font-medium">Stock</th>
                    <th className="pb-2 font-medium">Sold out</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {p.variants.map((v, i) => {
                    const problem = problems[i];
                    return (
                      <tr key={v.id ?? `new-${i}`} className="border-t border-[#efe6d8] align-top">
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2">
                            <input type="color" aria-label={`Row ${i + 1} swatch`} value={v.colorHex} onChange={(e) => setVariant(i, { colorHex: e.target.value })} className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-[#e4dccf] bg-transparent p-0" />
                            <input aria-label={`Row ${i + 1} colour`} value={v.color} onChange={(e) => setVariant(i, { color: e.target.value })} className={cn(inputClass, "h-9 w-32")} />
                          </div>
                          {problem ? <p className="mt-1 text-[11px] text-red-700">{problem}</p> : null}
                        </td>
                        <td className="py-2 pr-2">
                          <input aria-label={`Row ${i + 1} size`} value={v.size} onChange={(e) => setVariant(i, { size: e.target.value })} className={cn(inputClass, "h-9 w-20")} />
                        </td>
                        <td className="py-2 pr-2">
                          <input aria-label={`Row ${i + 1} price`} inputMode="decimal" value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} className={cn(inputClass, "h-9 w-28 tabular-nums")} />
                        </td>
                        <td className="py-2 pr-2">
                          <input aria-label={`Row ${i + 1} sale price`} inputMode="decimal" value={v.sale} placeholder="—" onChange={(e) => setVariant(i, { sale: e.target.value })} className={cn(inputClass, "h-9 w-28 tabular-nums")} />
                        </td>
                        <td className="py-2 pr-2">
                          <input aria-label={`Row ${i + 1} stock`} inputMode="numeric" value={v.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} className={cn(inputClass, "h-9 w-20 tabular-nums", !v.soldOut && Number(v.stock) > 0 && Number(v.stock) <= 2 && "border-[#e0b96b]")} />
                        </td>
                        <td className="py-3 pr-2">
                          <Toggle checked={v.soldOut} onChange={(value) => setVariant(i, { soldOut: value })} label={`Row ${i + 1} sold out`} />
                        </td>
                        <td className="py-2 text-right">
                          <button type="button" aria-label={`Remove row ${i + 1}`} onClick={() => set("variants", p.variants.filter((_, j) => j !== i))} className={dangerBtnClass}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-dashed border-[#d4c7b3] bg-[#faf7f2] p-3">
              <p className="mb-2 text-[12px] font-medium text-[#2b211c]">Add a colour</p>
              <div className="flex flex-wrap items-center gap-2">
                <input type="color" aria-label="New colour swatch" value={bulkHex} onChange={(e) => setBulkHex(e.target.value)} className="h-8 w-8 cursor-pointer rounded-full border border-[#e4dccf] bg-transparent p-0" />
                <input aria-label="New colour name" value={bulkColor} placeholder="e.g. Ivory" onChange={(e) => setBulkColor(e.target.value)} className={cn(inputClass, "h-9 w-36 bg-white")} />
                {SIZE_CHOICES.map((size) => {
                  const on = bulkSizes.includes(size);
                  return (
                    <button key={size} type="button" aria-pressed={on} onClick={() => setBulkSizes(on ? bulkSizes.filter((s) => s !== size) : [...bulkSizes, size])} className={cn("rounded-full border px-2.5 py-1 text-[11px]", on ? "border-[#2b211c] bg-[#2b211c] text-white" : "border-[#e4dccf] bg-white text-[#2b211c]")}>
                      {size}
                    </button>
                  );
                })}
                <button type="button" className={btnClass} onClick={addRows}>
                  + Add rows
                </button>
              </div>
              <p className="mt-2 text-[11px] text-[#8a7b6e]">New rows copy the last row&apos;s prices with 0 stock. A row with 0 stock shows as sold out in the shop.</p>
            </div>
          </Card>

          <Card title="Description" description="Shown on the product page.">
            <Field id="tagline" label="Short line under the name" max={140} optional value={p.tagline} onChange={(v) => set("tagline", v)} />
            <Field id="description" label="Description" max={2000} optional multiline rows={4} value={p.description} onChange={(v) => set("description", v)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="details" label="Details" max={1000} optional multiline rows={3} value={p.details} onChange={(v) => set("details", v)} />
              <Field id="materials" label="Fabric & materials" max={1000} optional multiline rows={3} value={p.materials} onChange={(v) => set("materials", v)} />
            </div>
            <Field id="care" label="Care" max={1000} optional multiline rows={2} value={p.care} onChange={(v) => set("care", v)} />
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Basics">
            <Field
              id="name"
              label="Name"
              max={120}
              value={p.name}
              onChange={(v) => setP((c) => ({ ...c, name: v, slug: slugTouched ? c.slug : slugify(v) }))}
            />
            <div>
              <label htmlFor="slug" className="mb-1.5 block text-[13px] font-medium text-[#2b211c]">Web address</label>
              <div className="flex items-center rounded-lg border border-[#e4dccf] bg-[#faf7f2] pl-3 text-[12px] text-[#8a7b6e] focus-within:border-[#b08d57]">
                /product/
                <input
                  id="slug"
                  value={p.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  className="h-10 min-w-0 flex-1 bg-transparent pr-3 font-mono text-[12.5px] text-[#2b211c] outline-none"
                />
              </div>
              {p.id && p.slug !== baseline.slug ? (
                <p className="mt-1 text-[11px] text-[#9a6b1f]">Changing this breaks old links and shared posts.</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="category" className="mb-1.5 block text-[13px] font-medium text-[#2b211c]">Category</label>
              <select id="category" value={p.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={cn(inputClass, "h-10")}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <ToggleRow label="New arrival" help="Shows in New Arrivals and gets a New tag" checked={p.isNew} onChange={(v) => set("isNew", v)} />
            <ToggleRow label="Bestseller" help="Can appear in the homepage bestsellers row" checked={p.isBestSeller} onChange={(v) => set("isBestSeller", v)} />
          </Card>
          <Card title="Summary">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="In stock" value={totalStock} />
              <Stat label="Colours" value={colours.length} />
              <Stat label="Low (≤2)" value={lowStock} warn={lowStock > 0} />
              <Stat label="Sold out rows" value={outOfStock} />
            </div>
          </Card>
        </aside>
      </div>

      <SaveBar
        dirtyLabels={p.id ? dirtyLabels : dirtyLabels.length ? dirtyLabels : []}
        message={message}
        tone={tone}
        pending={pending}
        onDiscard={() => {
          setP(baseline);
          setClientError(null);
        }}
        onSave={save}
        saveLabel={p.id ? "Save product" : "Create product"}
      />
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="rounded-lg bg-[#faf7f2] px-3 py-2.5">
      <p className={cn("font-serif text-2xl tabular-nums", warn ? "text-[#9a6b1f]" : "text-[#2b211c]")}>{value}</p>
      <p className="text-[10px] tracking-[0.12em] text-[#8a7b6e] uppercase">{label}</p>
    </div>
  );
}
