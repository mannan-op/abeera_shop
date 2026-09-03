import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/sections/reveal";
import { getCollections } from "@/lib/catalog";

export function FeaturedCollections() {
  const collections = getCollections();

  return (
    <Reveal>
      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="kicker">Collections</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
              This season, <em className="italic text-gold">in three rooms</em>
            </h2>
          </div>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-12 md:grid-rows-2 md:gap-4">
          {collections.map((collection, index) => (
            <Link
              key={collection.slug}
              href={collection.href}
              className={
                index === 0
                  ? "group relative min-h-[28rem] overflow-hidden md:col-span-7 md:row-span-2 md:min-h-[42rem]"
                  : "group relative min-h-[18rem] overflow-hidden md:col-span-5"
              }
            >
              <Image
                src={collection.image}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes={index === 0 ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 42vw"}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-[#14110e]/75 via-[#14110e]/15 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="kicker text-gold">0{index + 1}</p>
                <p className="mt-2 font-serif text-3xl text-ivory md:text-4xl">{collection.name}</p>
                <p className="mt-2 max-w-sm text-sm text-ivory/75">{collection.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
