/** Shapes shared by the product editor (client) and its server pages. */

export type EditorVariant = {
  id?: string;
  color: string;
  colorHex: string;
  size: string;
  /** Regular price in rupees, as typed. */
  price: string;
  /** Optional sale price in rupees, as typed. */
  sale: string;
  stock: string;
  soldOut: boolean;
};

export type EditorImage = { url: string; alt: string };

export type EditorProduct = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  details: string;
  materials: string;
  care: string;
  categoryId: string;
  isNew: boolean;
  isBestSeller: boolean;
  images: EditorImage[];
  variants: EditorVariant[];
};

export type ApiVariantLike = {
  id: string;
  color: string;
  colorHex: string;
  size: string;
  priceInPaisa: number;
  compareAtPrice: number | null;
  stock: number;
  soldOut: boolean;
};

const rupees = (paisa: number) => String(Math.round(paisa) / 100);

/** API variant → editor row. The API keeps the selling price and the struck-through original. */
export function toEditorVariant(v: ApiVariantLike): EditorVariant {
  const onSale = v.compareAtPrice != null && v.compareAtPrice > v.priceInPaisa;
  return {
    id: v.id,
    color: v.color,
    colorHex: v.colorHex,
    size: v.size,
    price: rupees(onSale ? v.compareAtPrice! : v.priceInPaisa),
    sale: onSale ? rupees(v.priceInPaisa) : "",
    stock: String(v.stock),
    soldOut: v.soldOut,
  };
}
