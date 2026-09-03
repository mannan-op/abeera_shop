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
import { popularSearches, searchSuggest } from "@/lib/catalog";
import { useShop } from "@/lib/store/shop";
import { formatPrice } from "@/lib/utils";

export function SearchDialog() {
  const { searchOpen, setSearchOpen, searchRecents, rememberSearch } = useShop();
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const results = searchSuggest(query, 6);

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
