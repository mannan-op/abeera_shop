import Image from "next/image";

import { IMG } from "@/lib/catalog";

export const metadata = {
  title: "The house",
  description: "Abeera is a Lahore house for lawn, chiffon, zardozi, and stitched pret.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <p className="kicker">The house</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">A Lahore house for cloth that knows the occasion.</h1>
      <div className="relative my-10 aspect-16/9 overflow-hidden rounded-xl">
        <Image src={IMG.heroEid} alt="Embroidered festive ensemble from the Abeera edit" fill className="object-cover" sizes="800px" />
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base">
        <p>
          Abeera began in Lahore. Lawn comes from Faisalabad, chiffon from mills we trust, and zardozi from artisans who have stitched for generations. The collection stays small on purpose.
        </p>
        <p>
          We edit for Eid, weddings, and the pret you actually wear. A suit should feel finished. A print should breathe. Embroidery should earn its place.
        </p>
        <p>
          Write to care@abeera.example, or visit when you are next in Lahore.
        </p>
      </div>
    </article>
  );
}
