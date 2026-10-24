import type { HomepageTrustItem } from "@abeera/shared";

export function TrustStrip({ items }: { items: HomepageTrustItem[] }) {
  return (
    <section aria-label="Shopping promises" className="border-y border-border px-[clamp(1.25rem,4vw,4.5rem)] py-10">
      <ul className="mx-auto grid max-w-[1440px] gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`}>
            <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase">{item.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{item.copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
