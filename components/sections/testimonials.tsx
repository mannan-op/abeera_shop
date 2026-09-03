"use client";

import * as React from "react";

import { Reveal } from "@/components/sections/reveal";
import { testimonials } from "@/lib/catalog";

export function Testimonials() {
  const [index, setIndex] = React.useState(0);
  const current = testimonials[index];

  return (
    <Reveal>
      <section className="bg-card px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="kicker">Our customers</p>
          <blockquote className="mt-10">
            <p className="font-serif text-3xl leading-snug italic md:text-5xl">
              “{current.quote}”
            </p>
            <footer className="mt-10 text-sm text-muted-foreground">
              {current.name} · {current.role}
            </footer>
          </blockquote>
          <div className="mt-12 flex items-center justify-center gap-6">
            <button
              type="button"
              className="kicker"
              onClick={() => setIndex((value) => (value + testimonials.length - 1) % testimonials.length)}
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              {index + 1} / {testimonials.length}
            </span>
            <button
              type="button"
              className="kicker"
              onClick={() => setIndex((value) => (value + 1) % testimonials.length)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
