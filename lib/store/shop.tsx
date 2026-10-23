"use client";

import * as React from "react";
import { toast } from "sonner";

import { useCatalogProducts } from "@/lib/catalog/use-products";
import type { CartItem, Product } from "@/lib/catalog/types";

type ShopContextValue = {
  cart: CartItem[];
  saved: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  searchRecents: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  navOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setNavOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQty: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  rememberView: (productId: string) => void;
  rememberSearch: (query: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
};

const ShopContext = React.createContext<ShopContextValue | null>(null);

function itemKey(item: Pick<CartItem, "productId" | "color" | "size">) {
  return `${item.productId}:${item.color}:${item.size}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [saved, setSaved] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = React.useState<string[]>([]);
  const [searchRecents, setSearchRecents] = React.useState<string[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);

  React.useEffect(() => {
    setCart(readJson("abeera:cart", []));
    setSaved(readJson("abeera:saved", []));
    setWishlist(readJson("abeera:wishlist", []));
    setRecentlyViewed(readJson("abeera:recent", []));
    setSearchRecents(readJson("abeera:searches", []));
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("abeera:cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("abeera:saved", JSON.stringify(saved));
  }, [saved, hydrated]);
  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("abeera:wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);
  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("abeera:recent", JSON.stringify(recentlyViewed));
  }, [recentlyViewed, hydrated]);
  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("abeera:searches", JSON.stringify(searchRecents));
  }, [searchRecents, hydrated]);

  const addToCart = React.useCallback(
    (incoming: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const quantity = incoming.quantity ?? 1;
      setCart((current) => {
        const key = itemKey(incoming);
        const existing = current.find((item) => itemKey(item) === key);
        if (existing) {
          return current.map((item) =>
            itemKey(item) === key
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...current, { ...incoming, quantity }];
      });
      setCartOpen(true);
      toast.success("Added to bag");
    },
    [],
  );

  const updateQty = React.useCallback((key: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (itemKey(item) === key ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = React.useCallback((key: string) => {
    setCart((current) => current.filter((item) => itemKey(item) !== key));
  }, []);

  const saveForLater = React.useCallback((key: string) => {
    setCart((current) => {
      const item = current.find((entry) => itemKey(entry) === key);
      if (item) {
        setSaved((savedItems) => [...savedItems.filter((entry) => itemKey(entry) !== key), item]);
      }
      return current.filter((entry) => itemKey(entry) !== key);
    });
  }, []);

  const moveToCart = React.useCallback((key: string) => {
    setSaved((current) => {
      const item = current.find((entry) => itemKey(entry) === key);
      if (item) {
        setCart((cartItems) => [...cartItems, item]);
      }
      return current.filter((entry) => itemKey(entry) !== key);
    });
  }, []);

  const toggleWishlist = React.useCallback((productId: string) => {
    setWishlist((current) => {
      if (current.includes(productId)) {
        toast("Removed from wishlist");
        return current.filter((id) => id !== productId);
      }
      toast.success("Saved to wishlist");
      return [...current, productId];
    });
  }, []);

  const isWishlisted = React.useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const rememberView = React.useCallback((productId: string) => {
    setRecentlyViewed((current) => [
      productId,
      ...current.filter((id) => id !== productId),
    ].slice(0, 8));
  }, []);

  const rememberSearch = React.useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchRecents((current) => [
      trimmed,
      ...current.filter((entry) => entry !== trimmed),
    ].slice(0, 6));
  }, []);

  const clearCart = React.useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: ShopContextValue = {
    cart,
    saved,
    wishlist,
    recentlyViewed,
    searchRecents,
    cartOpen,
    searchOpen,
    navOpen,
    setCartOpen,
    setSearchOpen,
    setNavOpen,
    addToCart,
    updateQty,
    removeFromCart,
    saveForLater,
    moveToCart,
    toggleWishlist,
    isWishlisted,
    rememberView,
    rememberSearch,
    clearCart,
    cartCount,
    cartSubtotal,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = React.useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within ShopProvider");
  }
  return context;
}

export function cartItemFromProduct(
  product: Product,
  color: string,
  size: string,
  quantity = 1,
): CartItem {
  const colorEntry = product.colors.find((entry) => entry.name === color) ?? product.colors[0];
  const variant = product.variants?.find((entry) => entry.color === color && entry.size === size);
  return {
    productId: product.id,
    variantId: variant?.id,
    slug: product.slug,
    name: product.name,
    image: colorEntry.images[0],
    color,
    size,
    price: variant?.price ?? product.price,
    quantity,
  };
}

export function useWishlistProducts() {
  const { wishlist } = useShop();
  return useCatalogProducts(wishlist);
}

export { itemKey };
