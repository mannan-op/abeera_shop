import Link from "next/link";

export function SaleBanner({ text }: { text: string }) {
  return (
    <div className="bg-[#2b211c] text-[#f6f1e8]">
      <Link
        href="/category/sale"
        className="block px-4 py-2.5 text-center text-[0.72rem] tracking-[0.18em] uppercase transition hover:text-[#e7d3a1]"
      >
        {text}
      </Link>
    </div>
  );
}
