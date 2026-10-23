"use client";

import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { useWishlistProducts } from "@/lib/store/shop";

export default function WishlistPage() {
  const products = useWishlistProducts();

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-4xl">Wishlist</h1>
      <div className="mt-8">
        <AccountNav />
      </div>
      <div className="mt-10">
        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl">Nothing saved yet</p>
            <Button asChild className="mt-6">
              <Link href="/shop">Browse the shop</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
