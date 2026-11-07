"use client";

import { ChevronDownIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Slider } from "@/components/ui/slider";
import { cn, formatPriceAmount } from "@/lib/utils";

type Availability = "all" | "in-stock" | "sale";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
  { value: "rating", label: "Top rated" },
];

const AVAILABILITY: { value: Availability; label: string }[] = [
  { value: "all", label: "All pieces" },
  { value: "in-stock", label: "In stock" },
  { value: "sale", label: "On sale" },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#eee8df] px-6 py-5">
      <h3 className="text-[12px] font-medium tracking-[0.08em] uppercase">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ShopToolbar({
  total,
  sizes,
  min,
  max,
  categories,
}: {
  total: number;
  sizes: string[];
  min: number;
  max: number;
  categories: { name: string; href: string }[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const urlSize = searchParams.get("size") ?? "";
  const rawAvailability = searchParams.get("availability");
  const urlAvailability: Availability = rawAvailability === "in-stock" || rawAvailability === "sale" ? rawAvailability : "all";
  const urlMin = Number(searchParams.get("min") ?? min);
  const urlMax = Number(searchParams.get("max") ?? max);
  const sort = searchParams.get("sort") ?? "featured";

  const [size, setSize] = React.useState(urlSize);
  const [availability, setAvailability] = React.useState<Availability>(urlAvailability);
  const [price, setPrice] = React.useState([urlMin, urlMax]);

  const priceActive = urlMin > min || urlMax < max;
  const activeCount = (urlSize ? 1 : 0) + (urlAvailability !== "all" ? 1 : 0) + (priceActive ? 1 : 0);
  const showPrice = max > min;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openPanel() {
    setSize(urlSize);
    setAvailability(urlAvailability);
    setPrice([urlMin, urlMax]);
    setOpen(true);
  }

  function push(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    params.delete("show");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function apply() {
    push((params) => {
      params.delete("size");
      if (size) params.set("size", size);
      if (availability === "all") params.delete("availability");
      else params.set("availability", availability);
      if (price[0] <= min) params.delete("min");
      else params.set("min", String(price[0]));
      if (price[1] >= max) params.delete("max");
      else params.set("max", String(price[1]));
    });
    setOpen(false);
  }

  function clearAll() {
    push((params) => ["size", "availability", "min", "max", "color"].forEach((key) => params.delete(key)));
    setOpen(false);
  }

  return (
    <>
      <div className="mt-5 mb-6 flex items-center justify-between gap-4 md:mt-8 md:mb-8">
        <button type="button" onClick={openPanel} className="inline-flex items-center gap-2 text-[13px] text-[#2b211c] hover:opacity-70">
          <SlidersHorizontalIcon className="size-4" aria-hidden />
          Filter
          {activeCount > 0 ? (
            <span className="grid size-[18px] place-items-center rounded-full bg-[#2b211c] text-[10px] text-white">{activeCount}</span>
          ) : null}
        </button>
        <div className="flex items-center gap-2.5 text-[12px] text-[#5c4f45]">
          <span className="hidden sm:inline">{total} Items</span>
          <span className="hidden text-[#d9cfc2] sm:inline">|</span>
          <label htmlFor="shop-sort" className="hidden sm:inline">
            Sort by:
          </label>
          <span className="relative">
            <select
              id="shop-sort"
              aria-label="Sort products"
              value={sort}
              onChange={(event) => push((params) => params.set("sort", event.target.value))}
              className="h-9 cursor-pointer appearance-none border border-[#d9cfc2] bg-white pr-8 pl-3 text-[12px] text-[#2b211c] outline-none focus:border-[#2b211c]"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 opacity-60" aria-hidden />
          </span>
        </div>
      </div>

      {activeCount > 0 ? (
        <div className="-mt-3 mb-6 flex flex-wrap items-center gap-2 text-[12px]">
          {urlSize ? <Chip label={`Size: ${urlSize}`} onRemove={() => push((p) => p.delete("size"))} /> : null}
          {urlAvailability !== "all" ? (
            <Chip label={urlAvailability === "sale" ? "On sale" : "In stock"} onRemove={() => push((p) => p.delete("availability"))} />
          ) : null}
          {priceActive ? (
            <Chip
              label={`Rs.${formatPriceAmount(urlMin)} – Rs.${formatPriceAmount(urlMax)}`}
              onRemove={() =>
                push((p) => {
                  p.delete("min");
                  p.delete("max");
                })
              }
            />
          ) : null}
          <button type="button" onClick={clearAll} className="ml-1 text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Clear all
          </button>
        </div>
      ) : null}

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={cn("fixed inset-0 z-50 bg-black/35 transition-opacity duration-300", open ? "opacity-100" : "pointer-events-none opacity-0")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-[380px] flex-col bg-white text-[#2b211c] shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-[#eee8df] px-6 py-5">
          <h2 className="text-[16px]">Filter</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="hover:opacity-70">
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Group title="Category">
            <ul className="grid gap-3 text-[13px] text-[#4a3f37]">
              <li>
                <span className="font-medium text-[#2b211c]">All pieces</span>
              </li>
              {categories.map((category) => (
                <li key={category.href}>
                  <Link href={category.href} className="hover:text-[#2b211c] hover:underline underline-offset-4">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Group>
          {sizes.length > 0 ? (
            <Group title="Size">
              <div className="flex flex-wrap gap-2">
                {sizes.map((option) => {
                  const active = size === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSize(active ? "" : option)}
                      className={cn(
                        "min-w-11 rounded-[3px] border px-3 py-2 text-[12px] transition-colors",
                        active ? "border-[#2b211c] bg-[#2b211c] text-white" : "border-[#d9cfc2] hover:border-[#2b211c]",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </Group>
          ) : null}
          {showPrice ? (
            <Group title="Price">
              <div className="flex justify-between text-[12px] text-[#4a3f37]">
                <span>Rs.{formatPriceAmount(price[0] ?? min)}</span>
                <span>Rs.{formatPriceAmount(price[1] ?? max)}</span>
              </div>
              <div className="mt-4 px-1">
                <Slider min={min} max={max} step={1000} value={price} onValueChange={setPrice} aria-label="Price range" />
              </div>
            </Group>
          ) : null}
          <Group title="Availability">
            <div className="grid gap-3">
              {AVAILABILITY.map((option) => {
                const active = availability === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setAvailability(option.value)}
                    className="flex items-center gap-3 text-left text-[13px] text-[#4a3f37]"
                  >
                    <span className={cn("grid size-4 place-items-center rounded-full border", active ? "border-[#2b211c]" : "border-[#bbb]")}>
                      {active ? <span className="size-2 rounded-full bg-[#2b211c]" /> : null}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Group>
        </div>
        <div className="flex gap-2.5 border-t border-[#eee8df] px-6 py-4">
          <button type="button" onClick={clearAll} className="flex-1 border border-[#2b211c] py-3 text-[12px] tracking-[0.1em] uppercase">
            Clear
          </button>
          <button type="button" onClick={apply} className="flex-1 bg-[#2b211c] py-3 text-[12px] tracking-[0.1em] text-white uppercase">
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#d9cfc2] bg-white px-3 py-1.5 hover:border-[#2b211c]"
    >
      {label}
      <XIcon className="size-3" aria-hidden />
      <span className="sr-only">Remove filter</span>
    </button>
  );
}
