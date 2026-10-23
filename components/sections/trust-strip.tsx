import { BanknoteIcon, RefreshCcwIcon, TruckIcon } from "lucide-react";

const cues = [
  { icon: TruckIcon, label: "Free delivery", detail: "On orders over Rs. 5,000" },
  { icon: RefreshCcwIcon, label: "Easy exchange", detail: "Unworn pieces, tags on" },
  { icon: BanknoteIcon, label: "Cash on delivery", detail: "Pay when it arrives" },
];

export function TrustStrip() {
  return (
    <section aria-label="Shopping promises" className="border-y border-border/80 bg-blush/50">
      <ul className="mx-auto grid max-w-[1100px] gap-6 px-5 py-8 sm:grid-cols-3 md:px-10 md:py-10">
        {cues.map((cue) => (
          <li key={cue.label} className="flex items-start gap-3 text-gold-ink">
            <cue.icon className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">{cue.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{cue.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
