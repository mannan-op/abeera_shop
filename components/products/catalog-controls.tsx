"use client";

import { ChevronDownIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { SortKey } from "@/lib/catalog/types";
import { cn, formatPrice } from "@/lib/utils";

type Options = {
  colors: { name: string; hex: string }[];
  sizes: string[];
  min: number;
  max: number;
};

const APPAREL = ["XS", "S", "M", "L", "XL"];
const FOOTWEAR = ["36", "37", "38", "39", "40", "41"];
const BELT = ["75", "80", "85", "90", "95"];

function sizesForView(sizes: string[]) {
  const apparel = APPAREL.filter((size) => sizes.includes(size));
  const oneSize = sizes.includes("One size") ? ["One size"] : [];
  const footwear = FOOTWEAR.filter((size) => sizes.includes(size));
  const belt = BELT.filter((size) => sizes.includes(size));
  const known = new Set([...APPAREL, "One size", ...FOOTWEAR, ...BELT]);
  const rest = sizes.filter((size) => !known.has(size));

  if (apparel.length >= 4 && (footwear.length > 0 || belt.length > 0)) {
    return [...apparel, ...oneSize];
  }
  return [...apparel, ...oneSize, ...footwear, ...belt, ...rest];
}

function FilterMenu({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex h-10 items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground",
          count > 0 && "text-foreground",
        )}
      >
        {label}
        {count > 0 ? <span className="text-gold">{count}</span> : null}
        <ChevronDownIcon className="size-3.5 opacity-50" />
      </PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  );
}

function SizeOptions({
  sizes,
  selected,
  onToggle,
}: {
  sizes: string[];
  selected: string[];
  onToggle: (size: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {sizes.map((size) => {
        const active = selected.includes(size);
        return (
          <button
            key={size}
            type="button"
            aria-pressed={active}
            className={cn(
              "h-8 text-[12px] tracking-[0.04em] text-muted-foreground transition-colors hover:text-foreground",
              active && "text-foreground underline underline-offset-4",
            )}
            onPointerDown={(event) => {
              event.preventDefault();
              onToggle(size);
            }}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

function ColourOptions({
  colors,
  selected,
  onToggle,
}: {
  colors: Options["colors"];
  selected: string[];
  onToggle: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-2.5">
      {colors.map((color) => {
        const active = selected.includes(color.name);
        return (
          <button
            key={color.name}
            type="button"
            title={color.name}
            aria-label={color.name}
            aria-pressed={active}
            className={cn(
              "size-6 rounded-full ring-1 ring-foreground/15 transition-shadow",
              active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            )}
            style={{ background: color.hex }}
            onPointerDown={(event) => {
              event.preventDefault();
              onToggle(color.name);
            }}
          />
        );
      })}
    </div>
  );
}

function PriceOptions({
  options,
  price,
  onChange,
  onCommit,
}: {
  options: Options;
  price: number[];
  onChange: (value: number[]) => void;
  onCommit: (value: number[]) => void;
}) {
  return (
    <div>
      <p className="text-[12px] tracking-[0.04em] text-muted-foreground">
        {formatPrice(price[0] ?? options.min)} – {formatPrice(price[1] ?? options.max)}
      </p>
      <div className="mt-4 px-1">
        <Slider
          min={options.min}
          max={options.max}
          step={1000}
          value={price}
          onValueChange={onChange}
          onValueCommit={onCommit}
          aria-label="Price range"
        />
      </div>
    </div>
  );
}

function FilterFields({ options }: { options: Options }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedColors = searchParams.getAll("color");
  const selectedSizes = searchParams.getAll("size");
  const availability = searchParams.get("availability") ?? "all";
  const urlMin = Number(searchParams.get("min") ?? options.min);
  const urlMax = Number(searchParams.get("max") ?? options.max);
  const [price, setPrice] = React.useState([urlMin, urlMax]);
  const visibleSizes = sizesForView(options.sizes);

  React.useEffect(() => {
    setPrice([urlMin, urlMax]);
  }, [urlMin, urlMax]);

  const priceActive = urlMin !== options.min || urlMax !== options.max;
  const hasFilters =
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    availability !== "all" ||
    priceActive;

  function setParam(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggle(key: string, value: string, current: string[]) {
    setParam((params) => {
      params.delete(key);
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];
      next.forEach((entry) => params.append(key, entry));
    });
  }

  function clearAll() {
    setParam((params) => {
      ["color", "size", "availability", "min", "max"].forEach((key) => params.delete(key));
    });
  }

  function commitPrice([nextMin, nextMax]: number[]) {
    setParam((params) => {
      if (nextMin === options.min) params.delete("min");
      else params.set("min", String(nextMin));
      if (nextMax === options.max) params.delete("max");
      else params.set("max", String(nextMax));
    });
  }

  function setAvailability(value: "all" | "in-stock" | "sale") {
    setParam((params) => {
      if (value === "all" || value === availability) params.delete("availability");
      else params.set("availability", value);
    });
  }

  const availabilityToggles = (
    <div className="flex items-center gap-4">
      {(
        [
          { value: "in-stock", label: "In stock" },
          { value: "sale", label: "Sale" },
        ] as const
      ).map((option) => {
        const active = availability === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            className={cn(
              "h-10 text-[11px] font-medium tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground",
              active && "text-foreground underline underline-offset-4",
            )}
            onClick={() => setAvailability(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  const chips = hasFilters ? (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {availability !== "all" ? (
        <FilterChip
          label={availability === "sale" ? "Sale" : "In stock"}
          onRemove={() => setAvailability("all")}
        />
      ) : null}
      {selectedColors.map((color) => (
        <FilterChip
          key={color}
          label={color}
          onRemove={() => toggle("color", color, selectedColors)}
        />
      ))}
      {selectedSizes.map((size) => (
        <FilterChip
          key={size}
          label={size}
          onRemove={() => toggle("size", size, selectedSizes)}
        />
      ))}
      {priceActive ? (
        <FilterChip
          label={`${formatPrice(urlMin)} – ${formatPrice(urlMax)}`}
          onRemove={() =>
            setParam((params) => {
              params.delete("min");
              params.delete("max");
            })
          }
        />
      ) : null}
      <button
        type="button"
        className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground"
        onClick={clearAll}
      >
        Clear
      </button>
    </div>
  ) : null;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-5">
        <FilterMenu label="Size" count={selectedSizes.length}>
          <SizeOptions
            sizes={visibleSizes}
            selected={selectedSizes}
            onToggle={(size) => toggle("size", size, selectedSizes)}
          />
        </FilterMenu>
        <FilterMenu label="Colour" count={selectedColors.length}>
          <ColourOptions
            colors={options.colors}
            selected={selectedColors}
            onToggle={(color) => toggle("color", color, selectedColors)}
          />
        </FilterMenu>
        <FilterMenu label="Price" count={priceActive ? 1 : 0}>
          <PriceOptions
            options={options}
            price={price}
            onChange={setPrice}
            onCommit={commitPrice}
          />
        </FilterMenu>
        {availabilityToggles}
      </div>
      {chips ? <div className="mt-3">{chips}</div> : null}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-[12px] text-foreground hover:text-muted-foreground"
      onClick={onRemove}
    >
      {label}
      <XIcon className="size-3" aria-hidden />
      <span className="sr-only">Remove {label}</span>
    </button>
  );
}

export function ProductFilters({ options }: { options: Options }) {
  return <FilterFields options={options} />;
}

export function ProductSort() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sort = (searchParams.get("sort") ?? "featured") as SortKey;

  return (
    <Select
      value={sort}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger
        className="h-10 w-auto gap-1.5 rounded-none border-0 bg-transparent px-0 text-[11px] font-medium tracking-[0.16em] uppercase"
        aria-label="Sort products"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="featured">Featured</SelectItem>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="price-asc">Price: Low</SelectItem>
        <SelectItem value="price-desc">Price: High</SelectItem>
        <SelectItem value="rating">Rating</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function CatalogToolbar({
  total,
  options,
}: {
  total: number;
  options: Options;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-border/70 pb-4">
      <p className="h-10 text-[11px] font-medium tracking-[0.16em] uppercase text-muted-foreground">
        {total} pieces
      </p>
      <div className="flex min-w-0 flex-1 flex-wrap items-start justify-end gap-x-6">
        <ProductFilters options={options} />
        <Label className="sr-only" htmlFor="sort">
          Sort
        </Label>
        <ProductSort />
      </div>
    </div>
  );
}
