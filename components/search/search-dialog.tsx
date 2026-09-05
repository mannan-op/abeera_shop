"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { popularSearches } from "@/lib/catalog";
import { products as memoryProducts } from "@/lib/catalog/products";
import type { Product } from "@/lib/catalog/types";
import { useShop } from "@/lib/store/shop";
import { formatPrice } from "@/lib/utils";

export function SearchDialog() {
  const { searchOpen, setSearchOpen, searchRecents, rememberSearch } = useShop();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.trim().toLowerCase();
    const local = memoryProducts
      .filter((product) =>
        [product.name, product.tagline, product.category].join(" ").toLowerCase().includes(q),
      )
      .slice(0, 6);
    setResults(local);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const controller = new AbortController();
    fetch(`${apiUrl}/products?search=${encodeURIComponent(query)}&pageSize=6`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.items?.length) return;
        setResults(
          data.items.map((item: {
            id: string;
            slug: string;
            name: string;
            tagline: string;
            startingPrice: number;
            compareAtPrice: number | null;
            primaryImage: string | null;
            rating: number;
            reviewCount: number;
            isNew: boolean;
            isBestSeller: boolean;
            soldOut: boolean;
            category: { slug: string };
          }) => {
            const image =
              item.primaryImage ??
              "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900";
            return {
              id: item.id,
              slug: item.slug,
              name: item.name,
              tagline: item.tagline,
              description: "",
              details: "",
              materials: "",
              care: "",
              category: item.category.slug === "accessories" ? "accessories" : "stitched-suits",
              price: item.startingPrice,
              compareAtPrice: item.compareAtPrice ?? undefined,
              rating: item.rating,
              reviewCount: item.reviewCount,
              isNew: item.isNew,
              isBestSeller: item.isBestSeller,
              colors: [{ name: "Default", hex: "#888", images: [image, image] as [string, string] }],
              sizes: ["S", "M", "L"],
              soldOut: item.soldOut,
            } satisfies Product;
          }),
        );
      })
      .catch(() => {
        // keep local results
      });

    return () => controller.abort();
  }, [query]);

  function go(href: string, term?: string) {
    if (term) rememberSearch(term);
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-xl p-0">
        <DialogTitle className="sr-only">Search Abeera</DialogTitle>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search the atelier"
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim()) {
                go(`/search?q=${encodeURIComponent(query.trim())}`, query.trim());
              }
            }}
          />
          <CommandList>
            {query ? (
              <>
                <CommandEmpty>No pieces match “{query}”.</CommandEmpty>
                <CommandGroup heading="Pieces">
                  {results.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.slug}
                      onSelect={() => go(`/product/${product.slug}`, query)}
                    >
                      <span className="relative size-12 overflow-hidden">
                        <Image
                          src={product.colors[0].images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </span>
                      <span className="flex-1">
                        <span className="block">{product.name}</span>
                        <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : (
              <>
                {searchRecents.length > 0 ? (
                  <CommandGroup heading="Recent">
                    {searchRecents.map((term) => (
                      <CommandItem
                        key={term}
                        value={term}
                        onSelect={() => go(`/search?q=${encodeURIComponent(term)}`, term)}
                      >
                        {term}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                <CommandGroup heading="Popular">
                  {popularSearches.map((term) => (
                    <CommandItem
                      key={term}
                      value={term}
                      onSelect={() => go(`/search?q=${encodeURIComponent(term)}`, term)}
                    >
                      {term}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
