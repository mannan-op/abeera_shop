export const metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <article className="prose-abeera mx-auto max-w-2xl px-5 py-16 md:py-24">
      <h1 className="font-serif text-4xl">Shipping</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Orders placed before 14:00 CET leave the atelier the same weekday. Europe typically arrives in 2–4 days; the United States and the Middle East in 4–7. Complimentary shipping applies over $400.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Duties, where they apply, are estimated at checkout and collected so the parcel is not stopped at the border. A tracking number is sent as soon as the parcel is in transit.
      </p>
    </article>
  );
}
