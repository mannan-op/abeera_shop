import type { Address, Order, Review, Testimonial } from "@/lib/catalog/types";

export const testimonials: Testimonial[] = [
  {
    quote:
      "The Harbor coat arrived and I cancelled two others. It has the kind of shoulder you only find in a proper atelier.",
    name: "Amira K.",
    role: "Architect, Lisbon",
  },
  {
    quote:
      "Abeera is the first brand whose white shirt I have reordered. The Cloud shirt does not gape, does not cling, does not shout.",
    name: "Helen R.",
    role: "Editor, London",
  },
  {
    quote:
      "I wore the Lumen slip under the Night trench to a wedding and three people asked who made the dress. That is all I want from clothes.",
    name: "Sofia M.",
    role: "Curator, Milan",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "p-lumen-slip",
    author: "Clara N.",
    location: "Paris",
    rating: 5,
    title: "The only slip I will travel with",
    body: "The bias cut is honest — it hangs, it does not cling. Ivory photographs as quiet, not bridal.",
    date: "2026-04-12",
  },
  {
    id: "r2",
    productId: "p-harbor-coat",
    author: "Leila S.",
    location: "New York",
    rating: 5,
    title: "Worth the wait",
    body: "Weight without bulk. I wear it open over the Cloud shirt and it still looks finished.",
    date: "2026-03-02",
  },
  {
    id: "r3",
    productId: "p-cloud-shirt",
    author: "Maya P.",
    location: "Copenhagen",
    rating: 5,
    title: "Finally a white shirt",
    body: "The hidden placket is the entire difference. I own two.",
    date: "2026-02-18",
  },
];

export const demoAddress: Address = {
  id: "addr-home",
  label: "Home",
  name: "Amira Khalil",
  line1: "18 Rue des Archives",
  city: "Paris",
  region: "Île-de-France",
  postalCode: "75004",
  country: "France",
  phone: "+33 1 42 00 00 00",
};

export const demoOrders: Order[] = [
  {
    id: "ord-1842",
    number: "AB-1842",
    placedAt: "2026-08-12T10:00:00.000Z",
    status: "delivered",
    items: [
      {
        productId: "p-cloud-shirt",
        slug: "cloud-cotton-shirt",
        name: "Cloud Cotton Shirt",
        image: "",
        color: "White",
        size: "S",
        price: 18800,
        quantity: 1,
      },
    ],
    subtotal: 18800,
    shipping: 0,
    tax: 1504,
    total: 20304,
    address: demoAddress,
    estimatedDelivery: "Delivered 18 Aug 2026",
  },
  {
    id: "ord-1901",
    number: "AB-1901",
    placedAt: "2026-08-28T10:00:00.000Z",
    status: "shipped",
    items: [
      {
        productId: "p-oval-hoops",
        slug: "oval-gold-hoops",
        name: "Oval Gold Hoops",
        image: "",
        color: "Gold",
        size: "One size",
        price: 16800,
        quantity: 1,
      },
    ],
    subtotal: 16800,
    shipping: 1800,
    tax: 1344,
    total: 19944,
    address: demoAddress,
    estimatedDelivery: "Est. 4 Sep 2026",
  },
];

export const faqs = [
  {
    question: "How long does shipping take?",
    answer:
      "Orders placed before 14:00 CET leave the atelier the same day. Europe: 2–4 days. United States and Middle East: 4–7 days. A tracking number is sent as soon as the parcel is in transit.",
  },
  {
    question: "What is your returns policy?",
    answer:
      "Unworn pieces with tags may be returned within 30 days. Sale items are final. Made-to-order and pierced jewellery cannot be returned. Use the prepaid label in your parcel or start a return from your order page.",
  },
  {
    question: "Do you offer alterations?",
    answer:
      "Hemming and waist suppression are available on trousers, coats, and dresses at the atelier in Paris. Write to care@abeera.example with your order number.",
  },
  {
    question: "How do I find my size?",
    answer:
      "Each product includes a size guide with garment measurements. If you are between sizes, we generally recommend the smaller for structured pieces and the larger for linen and silk. Our care team will advise within a day.",
  },
  {
    question: "Are your materials traced?",
    answer:
      "Silk is mill-traced in Italy. Linen is European flax. Cashmere is Grade A from Inner Mongolia, dyed in Scotland. Leather is vegetable-tanned in Tuscany. We publish mill names on request.",
  },
];

export const shippingMethods = [
  {
    id: "standard",
    name: "Standard",
    detail: "4–7 business days",
    price: 1800,
  },
  {
    id: "express",
    name: "Express",
    detail: "2–3 business days",
    price: 3800,
  },
  {
    id: "atelier",
    name: "Atelier complimentary",
    detail: "Orders over $400 · 4–7 days",
    price: 0,
  },
] as const;
