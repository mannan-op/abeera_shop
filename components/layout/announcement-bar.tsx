import Link from "next/link";

export function AnnouncementBar({ messages }: { messages: { text: string; href?: string }[] }) {
  const loop = [...messages, ...messages];

  return (
    <div className="overflow-hidden bg-espresso text-champagne-soft" role="region" aria-label="Announcements">
      <p className="sr-only">{messages.map((m) => (/[.!?]$/.test(m.text) ? m.text : `${m.text}.`)).join(" ")}</p>
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
