import Link from "next/link";

export function AnnouncementBar() {
  const message = "Free delivery over Rs. 5,000 · Eid Collection now live · Lahore · Details";

  return (
    <div className="overflow-hidden bg-primary text-ivory hover:[&_.animate-marquee]:[animation-play-state:paused]">
      <p className="sr-only">
        Free delivery over Rs. 5,000.{" "}
        <Link href="/shipping">Shipping details</Link>
      </p>
      <div className="flex whitespace-nowrap py-2 text-[11px] tracking-[0.18em] uppercase" aria-hidden>
        <div className="animate-marquee flex min-w-full shrink-0 justify-around">
          <span className="px-8">{message}</span>
          <span className="px-8">{message}</span>
        </div>
        <div className="animate-marquee flex min-w-full shrink-0 justify-around">
          <span className="px-8">{message}</span>
          <span className="px-8">{message}</span>
        </div>
      </div>
    </div>
  );
}
