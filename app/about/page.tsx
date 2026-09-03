import Image from "next/image";

import { IMG } from "@/lib/catalog";

export const metadata = {
  title: "The house",
  description: "Abeera is a contemporary fashion house in Paris.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <p className="kicker">The house</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">Named for a woman who dressed as if the room were enough.</h1>
      <div className="relative my-10 aspect-16/9 overflow-hidden">
        <Image src={IMG.atelier} alt="Cloth on the Abeera rails" fill className="object-cover" sizes="800px" />
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base">
        <p>
          Abeera began above a courtyard in the Marais — a table, a window, and a handful of mills that still answer the telephone. We cut silk from Como, linen from Flanders, cashmere from Scotland. The collection is small on purpose.
        </p>
        <p>
          We do not chase seasons so much as we edit them. A coat should outlast a trend. A white shirt should not gape. A hoop should be light enough for Tuesday.
        </p>
        <p>
          The atelier is open by appointment. Write to care@abeera.example, or visit the shop when you are next in Paris.
        </p>
      </div>
    </article>
  );
}
