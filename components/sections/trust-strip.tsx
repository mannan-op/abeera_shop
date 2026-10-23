const cues = [
  { label: "Free delivery", detail: "On orders over Rs. 5,000." },
  { label: "Easy exchange", detail: "Unworn pieces, tags on." },
  { label: "Cash on delivery", detail: "Pay when it arrives." },
  { label: "JazzCash · EasyPaisa", detail: "At checkout with COD." },
];

export function TrustStrip() {
  return (
    <section aria-label="Shopping promises" className="border-y border-border px-[clamp(1.25rem,4vw,4.5rem)] py-10">
      <ul className="mx-auto grid max-w-[1440px] gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
        {cues.map((cue) => (
          <li key={cue.label}>
            <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase">{cue.label}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{cue.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
