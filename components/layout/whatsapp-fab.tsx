function WhatsAppMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 20.5 3.5zM12 20.4a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.4zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.2-.7.9-.9 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8 8 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.2-.4a.5.5 0 0 0 0-.4c-.1-.1-.6-1.5-.8-2s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 12 12 0 0 0 4.5 4c.6.2 1 .4 1.5.5a3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.3z" />
    </svg>
  );
}

export function WhatsAppFab() {
  const digits = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const href = digits ? `https://wa.me/${digits}` : "/contact";
  const external = Boolean(digits);

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label={external ? "WhatsApp help" : "Contact Abeera"}
      className="fixed right-4 bottom-5 z-40 grid size-12 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:scale-105"
    >
      <WhatsAppMark className="size-5" />
    </a>
  );
}
