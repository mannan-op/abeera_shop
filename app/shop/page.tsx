import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { getShopPageContent } from "@/lib/site/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getShopPageContent();
  return { title: seo.title, description: seo.description };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, content] = await Promise.all([searchParams, getShopPageContent()]);
  const { heading, banner } = content;
  return (
    <div className="mx-auto max-w-[1440px] px-3.5 pt-5 pb-16 md:px-10 md:pt-7 md:pb-24">
      {content.showBreadcrumbs ? <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Shop" }]} /> : null}
      {heading.visible ? (
        <header className="mx-auto mt-8 max-w-2xl text-center md:mt-12">
          {heading.kicker ? <p className="text-[0.65rem] tracking-[0.18em] text-champagne uppercase">{heading.kicker}</p> : null}
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{heading.title}</h1>
          {heading.intro ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{heading.intro}</p> : null}
        </header>
      ) : (
        <h1 className="sr-only">{heading.title}</h1>
      )}
      {banner.enabled && banner.imageUrl ? (
        <section className="relative mt-8 overflow-hidden rounded-2xl bg-[#efe7db] md:mt-10" aria-label={banner.title || "Shop banner"}>
          <div className="relative aspect-[16/9] md:aspect-[21/7]">
            <Image src={banner.imageUrl} alt={banner.imageAlt} fill priority sizes="(min-width: 1440px) 1360px, 100vw" className="object-cover" />
            {banner.title || banner.buttonLabel ? (
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/45 via-black/10 to-transparent p-6 md:p-10">
                <div className="text-paper">
                  {banner.kicker ? <p className="text-[0.65rem] tracking-[0.18em] uppercase opacity-90">{banner.kicker}</p> : null}
                  {banner.title ? <p className="mt-1 font-serif text-3xl md:text-5xl">{banner.title}</p> : null}
                  {banner.buttonLabel && banner.href ? (
                    <Link href={banner.href} className="mt-4 inline-block border border-paper/80 px-5 py-2.5 text-[0.65rem] tracking-[0.16em] uppercase transition hover:bg-paper hover:text-ink">
                      {banner.buttonLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
      <Suspense fallback={<Skeleton className="mt-10 h-[60vh]" />}>
        <ShopCatalog searchParams={params} />
      </Suspense>
    </div>
  );
}
