import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-secondary text-gold-on-dark">
      <p className="px-4 py-2 text-center text-[12px] leading-snug tracking-[0.04em] sm:text-[13px]">
        Free delivery over Rs. 5,000
        <span aria-hidden="true"> · </span>
        <Link href="/shop" className="underline-offset-4 hover:underline">
          Eid Collection now live
        </Link>
      </p>
    </div>
  );
}
