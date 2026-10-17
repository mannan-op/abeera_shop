import type { Address, Order, Review, Testimonial } from "@/lib/catalog/types";

export const testimonials: Testimonial[] = [
  {
    quote:
      "The embroidery on the Eid formal was so fine, everyone at the daawat asked for the brand. This is the quality I grew up seeing in my mother's wardrobe.",
    name: "Ayesha R.",
    role: "Doctor, Lahore",
  },
  {
    quote:
      "I ordered the lawn suit unstitched and the fabric is exactly what I wanted — soft, breathable, and the print is even more beautiful in person.",
    name: "Hira N.",
    role: "Teacher, Islamabad",
  },
  {
    quote:
      "I wore the luxury prêt kurta to a mehndi and received so many compliments. Abeera understands Pakistani women — elegant without being overdone.",
    name: "Sana M.",
    role: "Designer, Karachi",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "p-lumen-slip",
    author: "Fatima A.",
    location: "Lahore",
    rating: 5,
    title: "Perfect for Eid",
    body: "The fabric quality is outstanding and the embroidery is delicate. Received so many compliments at the family gathering.",
    date: "2026-04-12",
  },
  {
    id: "r2",
    productId: "p-harbor-coat",
    author: "Zara K.",
    location: "Karachi",
    rating: 5,
    title: "Beautiful formal piece",
    body: "The zardozi work is exquisite. Wore this to a valima and it was perfect — elegant without being heavy.",
    date: "2026-03-02",
  },
  {
    id: "r3",
    productId: "p-cloud-shirt",
    author: "Mehreen S.",
    location: "Islamabad",
    rating: 5,
    title: "My go-to kurta",
    body: "The cotton is so soft and the stitching is flawless. I have ordered two more for daily wear.",
    date: "2026-02-18",
  },
];

export const demoAddress: Address = {
  id: "addr-home",
  label: "Home",
  name: "Abeera Ahmed",
  line1: "42 M.M. Alam Road, Gulberg III",
  city: "Lahore",
  region: "Punjab",
  postalCode: "54000",
  country: "Pakistan",
  phone: "+92 300 1234567",
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
    question: "How long does delivery take?",
    answer:
      "Orders within Pakistan are delivered in 3–5 business days. International orders take 7–12 business days. You will receive a tracking number via SMS and email once your order ships.",
  },
  {
    question: "What is your return & exchange policy?",
    answer:
      "Unworn items with tags may be returned or exchanged within 14 days. Sale items and stitched-to-order pieces are final sale. Contact us via WhatsApp or email to initiate a return.",
  },
  {
    question: "Do you offer stitching?",
    answer:
      "Yes, we offer custom stitching on all unstitched suits. Select your size and preferred style at checkout. Stitched orders take an additional 5–7 business days.",
  },
  {
    question: "How do I find my size?",
    answer:
      "Each product page includes a detailed size chart with bust, waist, hip, and length measurements. For unstitched fabric, we include a measurement form at checkout. Our team is available on WhatsApp for guidance.",
  },
  {
    question: "What fabrics do you use?",
    answer:
      "We source lawn from Faisalabad, chiffon and organza from trusted mills, and our embroidery is done by skilled artisans in Lahore and Multan. Silk is sourced from quality suppliers in Pakistan and abroad.",
  },
];

export const shippingMethods = [
  {
    id: "standard",
    name: "Standard",
    detail: "3–5 business days. Complimentary over Rs. 5,000.",
    price: 30000,
  },
  {
    id: "express",
    name: "Express",
    detail: "1–2 business days",
    price: 50000,
  },
] as const;
