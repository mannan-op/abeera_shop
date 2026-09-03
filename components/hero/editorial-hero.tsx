"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";

import { IMG } from "@/lib/catalog";

export function EditorialHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-primary">
      <motion.div
        initial={reduce ? false : { scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <Image
          src={IMG.hero}
          alt="Model in Abeera embroidered ensemble, soft natural light"
          fill
          priority
          className="object-cover object-[center_20%]"
          sizes="100vw"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-[#14110e]/85 via-[#14110e]/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[#14110e]/70 to-transparent"
      />
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-5 pb-10 pt-36 md:px-10 md:pb-12">
        <p className="kicker text-gold">Eid Collection · Lahore</p>
        <h1 className="mt-4 max-w-5xl font-serif text-[clamp(2.75rem,9vw,8rem)] leading-[0.92] text-ivory">
          Woven with
          <br />
          <em className="font-serif text-[0.78em] font-normal italic text-gold">tradition & grace.</em>
        </h1>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 w-fit items-center border border-ivory px-8 text-[12px] font-medium uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-ivory hover:text-primary"
        >
          Shop now
        </Link>
        <a
          href="#campaigns"
          className="mt-10 mb-2 flex size-11 items-center justify-center self-center rounded-full border border-ivory/50 text-ivory transition-colors hover:bg-ivory hover:text-primary"
          aria-label="Scroll to collections"
        >
          <ChevronDownIcon className="size-5" />
        </a>
      </div>
    </section>
  );
}
