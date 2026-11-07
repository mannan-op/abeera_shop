"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  defaultShopPageContent,
  shopPageSchema,
  siteIssueMessage,
  type ShopPageContent,
  type SiteDocumentResponse,
} from "@abeera/shared";

import { AdminHeader, SaveBar, ToggleRow, btnClass, type SaveTone } from "@/components/admin/admin-ui";
import { Card, Field, ImageField, LinkField, isSafeLink } from "@/components/admin/homepage-fields";
import { saveShopPageAction } from "@/lib/admin/site";
import { cn } from "@/lib/utils";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const when = (iso: string | null) => (iso ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : null);

const GROUPS: { key: keyof ShopPageContent; label: string }[] = [
  { key: "heading", label: "Heading" },
  { key: "showBreadcrumbs", label: "Breadcrumbs" },
  { key: "banner", label: "Banner" },
  { key: "seo", label: "SEO" },
];

export function ShopPageForm({ initial }: { initial: SiteDocumentResponse<ShopPageContent> }) {
  const [c, setC] = useState(initial.content);
  const [baseline, setBaseline] = useState(initial.content);
  const [tone, setTone] = useState<SaveTone>("idle");
  const [message, setMessage] = useState(initial.updatedAt ? `All changes saved. Last saved ${when(initial.updatedAt)}.` : "Using the original Shop page.");
  const [pending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const changed = GROUPS.filter((g) => !same(c[g.key], baseline[g.key]));

  useEffect(() => {
    if (!changed.length) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed.length]);

  const heading = (v: Partial<ShopPageContent["heading"]>) => setC((x) => ({ ...x, heading: { ...x.heading, ...v } }));
  const banner = (v: Partial<ShopPageContent["banner"]>) => setC((x) => ({ ...x, banner: { ...x.banner, ...v } }));

  function save() {
    const parsed = shopPageSchema.safeParse(c);
    if (!parsed.success) {
      setTone("error");
      setMessage(siteIssueMessage(parsed.error));
      return;
    }
    startTransition(async () => {
      const res = await saveShopPageAction(parsed.data);
      if (!res.ok) {
        setTone("error");
        setMessage(res.error);
        return;
      }
      setBaseline(parsed.data);
      setTone("saved");
      setMessage(`Published. Last saved ${when(res.updatedAt) ?? "just now"}.`);
    });
  }

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Storefront" }, { label: "Shop page" }]}
        title="Shop page"
        description="The heading and banner above the product grid on /shop. Category circles come from Catalog → Categories."
        action={
          <Link href="/shop" target="_blank" className={btnClass}>
            View /shop ↗
          </Link>
        }
      />
      <div key={formKey} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="min-w-0 space-y-5">
          <Card title="Heading" description="Off keeps the original look: the title is read by screen readers and Google but not shown.">
            <ToggleRow label="Show the heading on the page" checked={c.heading.visible} onChange={(v) => heading({ visible: v })} />
            <Field id="sp-kicker" label="Small line above the title" max={60} optional value={c.heading.kicker} onChange={(v) => heading({ kicker: v })} />
            <Field id="sp-title" label="Title" max={80} value={c.heading.title} onChange={(v) => heading({ title: v })} />
            <Field id="sp-intro" label="Intro sentence" max={320} optional multiline rows={2} value={c.heading.intro} onChange={(v) => heading({ intro: v })} />
            <ToggleRow label="Show breadcrumbs (Home / Shop)" checked={c.showBreadcrumbs} onChange={(v) => setC((x) => ({ ...x, showBreadcrumbs: v }))} />
          </Card>
          <Card title="Banner" description="Optional wide image above the category circles — for a sale or new drop.">
            <ToggleRow label="Show banner" checked={c.banner.enabled} onChange={(v) => banner({ enabled: v })} />
            <ImageField id="sp-banner" url={c.banner.imageUrl} alt={c.banner.imageAlt} onUrl={(v) => banner({ imageUrl: v })} onAlt={(v) => banner({ imageAlt: v })} optional={!c.banner.enabled} altOptional help="Wide images work best (about 2100 × 700)." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="sp-bkicker" label="Small line" max={60} optional value={c.banner.kicker} onChange={(v) => banner({ kicker: v })} />
              <Field id="sp-btitle" label="Banner title" max={80} optional value={c.banner.title} onChange={(v) => banner({ title: v })} />
              <Field id="sp-bbutton" label="Button text" max={40} optional value={c.banner.buttonLabel} onChange={(v) => banner({ buttonLabel: v })} />
              <LinkField id="sp-bhref" label="Button goes to" value={c.banner.href} onChange={(v) => banner({ href: v })} />
            </div>
          </Card>
          <Card title="Search & sharing">
            <Field id="sp-seo-title" label="Page title" max={70} value={c.seo.title} onChange={(v) => setC((x) => ({ ...x, seo: { ...x.seo, title: v } }))} help="Shown in the browser tab with your site name after it." />
            <Field id="sp-seo-desc" label="Description" max={200} multiline rows={2} value={c.seo.description} onChange={(v) => setC((x) => ({ ...x, seo: { ...x.seo, description: v } }))} />
          </Card>
        </div>
        <aside className="hidden xl:block">
          <div className="sticky top-4 rounded-xl bg-[#f3eee6] p-4">
            <p className="mb-3 text-[10px] tracking-[0.16em] text-[#8a7b6e] uppercase">Live preview</p>
            <div className="overflow-hidden rounded-xl bg-[#faf7f2] p-4 shadow-[0_8px_24px_rgba(43,33,28,0.1)]">
              {c.showBreadcrumbs ? <p className="text-[9px] tracking-[0.1em] text-[#8a7b6e] uppercase">Home / Shop</p> : null}
              {c.heading.visible ? (
                <div className="mt-3 text-center">
                  {c.heading.kicker ? <p className="text-[8px] tracking-[0.18em] text-[#b08d57] uppercase">{c.heading.kicker}</p> : null}
                  <p className="font-serif text-2xl text-[#2b211c]">{c.heading.title}</p>
                  {c.heading.intro ? <p className="mt-1 text-[10px] text-[#8a7b6e]">{c.heading.intro}</p> : null}
                </div>
              ) : (
                <p className="mt-2 text-center text-[10px] text-[#b3a697] italic">Heading hidden (screen readers only)</p>
              )}
              {c.banner.enabled ? (
                <div className="relative mt-3 aspect-[21/8] overflow-hidden rounded-lg bg-[#e9e2d6]">
                  {isSafeLink(c.banner.imageUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.banner.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/45 to-transparent p-3 text-white">
                    <div>
                      {c.banner.kicker ? <p className="text-[7px] tracking-[0.16em] uppercase">{c.banner.kicker}</p> : null}
                      {c.banner.title ? <p className="font-serif text-base">{c.banner.title}</p> : null}
                      {c.banner.buttonLabel ? <span className="mt-1 inline-block border border-white/80 px-2 py-0.5 text-[7px] tracking-[0.14em] uppercase">{c.banner.buttonLabel}</span> : null}
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="mt-3 flex justify-center gap-2">
                {["All", "New", "Sale", "Suits", "Acc."].map((label) => (
                  <div key={label} className="text-center">
                    <span className="block h-9 w-9 rounded-full border-2 border-white bg-[#e2d6c4] shadow" />
                    <span className="text-[7px] uppercase">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className={cn("aspect-[3/4] rounded bg-[#e9e2d6]", i % 3 === 0 && "bg-[#e2d6c4]")} />
                ))}
              </div>
            </div>
            <p className="mt-2.5 text-[11px] text-[#8a7b6e]">Updates as you type. Nothing goes live until you publish.</p>
          </div>
        </aside>
      </div>
      <SaveBar
        dirtyLabels={changed.map((g) => g.label)}
        message={message}
        tone={tone}
        pending={pending}
        onDiscard={() => {
          setC(baseline);
          setFormKey((k) => k + 1);
          setTone("idle");
        }}
        onSave={save}
        extra={
          <button
            type="button"
            className={cn(btnClass, "border-transparent bg-transparent text-[#8a7b6e]")}
            onClick={() => {
              setC(structuredClone(defaultShopPageContent));
              setFormKey((k) => k + 1);
            }}
          >
            Restore original
          </button>
        }
      />
    </div>
  );
}
