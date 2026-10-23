import Link from "next/link";

const messages: { text: string; href?: string }[] = [
  { text: "Free delivery over Rs. 5,000" },
  { text: "Cash on delivery available" },
  { text: "Eid collection now live", href: "/shop" },
  { text: "WhatsApp help on product pages", href: "/contact" },
];

export function AnnouncementBar() {
  const loop = [...messages, ...messages];

  return (
    <div className="overflow-hidden bg-espresso text-champagne-soft" role="region" aria-label="Announcements">
      <p className="sr-only">
        Free delivery over Rs. 5,000. Cash on delivery available. Eid collection now live. WhatsApp help on
        product pages.
      </p>
      <div aria-hidden className="flex w-max animate-marquee py-2">
        {loop.map((message, index) => (
          <span key={`${message.text}-${index}`} className="px-8 text-[0.65rem] tracking-[0.16em] uppercase">
            {message.href ? (
              <Link href={message.href} tabIndex={-1} className="hover:text-paper">
                {message.text}
              </Link>
            ) : (
              message.text
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
