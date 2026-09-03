"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { useShop } from "@/lib/store/shop";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue);
  const router = useRouter();
  const { rememberSearch } = useShop();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const query = value.trim();
        if (!query) return;
        rememberSearch(query);
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }}
    >
      <label htmlFor="search-page" className="sr-only">
        Search
      </label>
      <Input
        id="search-page"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Silk, camel, linen…"
      />
    </form>
  );
}
