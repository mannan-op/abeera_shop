"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  defaultHomepageContent,
  homepageContentSchema,
  homepageIssueMessage,
  type HomepageContent,
  type HomepageDocumentResponse,
  type HomepageLookbookEdit,
  type HomepageMoment,
  type HomepageTile,
  type HomepageTrustItem,
} from "@abeera/shared";

import { Card, Field, ImageField, ItemCards, LinkField, describeLink } from "@/components/admin/homepage-fields";
import { HomepagePreview } from "@/components/admin/homepage-preview";
import { saveHomepageAction, type HomepageSaveState } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

type SectionKey = keyof HomepageContent;
type ObjectKey = "hero" | "moments" | "productRail" | "brandStory" | "newsletter" | "lookbook";

const idleState: HomepageSaveState = { status: "idle", message: "" };

const SECTIONS: { key: SectionKey; name: string; note: (c: HomepageContent) => string }[] = [
  { key: "hero", name: "Hero banner", note: () => "Big image at the top" },
  { key: "collections", name: "Collection tiles", note: (c) => `${c.collections.length} image links` },
  { key: "moments", name: "Shop by moment", note: (c) => `${c.moments.moments.length} cards` },
  { key: "productRail", name: "Bestsellers heading", note: () => "Above the product rail" },
  { key: "brandStory", name: "Brand story", note: () => "About the house" },
  { key: "trust", name: "Trust strip", note: (c) => `${c.trust.length} promises` },
  { key: "newsletter", name: "Newsletter", note: () => "Email sign-up" },
  { key: "lookbook", name: "Lookbook", note: () => "Shown if no products" },
];

const sectionName = (key: SectionKey) => SECTIONS.find((s) => s.key === key)?.name ?? key;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function blankTile(): HomepageTile {
  return { ...defaultHomepageContent.collections[0], title: "New collection", label: "Shop now", href: "/shop" };
}
function blankMoment(): HomepageMoment {
  return { ...defaultHomepageContent.moments.moments[0], title: "New moment", copy: "A short line for this edit.", href: "/shop" };
}
function blankTrust(): HomepageTrustItem {
  return { title: "New promise", copy: "A short detail." };
}
function blankEdit(): HomepageLookbookEdit {
  return { ...defaultHomepageContent.lookbook.edits[0], title: "New edit", copy: "A short line for this edit.", href: "/shop" };
}

function formatWhen(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

const btn =
  "rounded-lg border border-[#e4dccf] bg-white px-3.5 py-2 text-xs font-medium text-[#2b211c] transition hover:border-[#b08d57] disabled:opacity-40";

export function HomepageForm({ initial }: { initial: HomepageDocumentResponse }) {
  const [content, setContent] = useState<HomepageContent>(initial.content);
  const [baseline, setBaseline] = useState<HomepageContent>(initial.content);
  const [active, setActive] = useState<SectionKey>("hero");
  const [item, setItem] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(formatWhen(initial.updatedAt));
  const [state, formAction, pending] = useActionState(saveHomepageAction, idleState);
  const submitted = useRef<HomepageContent | null>(null);

  useEffect(() => {
    if (state.status === "saved" && submitted.current) {
      setBaseline(submitted.current);
      setSavedAt(formatWhen(new Date().toISOString()));
      submitted.current = null;
    }
  }, [state]);

  const changed = SECTIONS.filter((s) => !same(content[s.key], baseline[s.key])).map((s) => s.key);
  const dirty = changed.length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function selectSection(key: SectionKey) {
    setActive(key);
    setItem(0);
  }

  function patch<K extends ObjectKey>(key: K, value: Partial<HomepageContent[K]>) {
    setContent((c) => ({ ...c, [key]: { ...c[key], ...value } }) as HomepageContent);
  }

  function setList<K extends "collections" | "trust">(key: K, value: HomepageContent[K], next?: number) {
    setContent((c) => ({ ...c, [key]: value }));
    if (next !== undefined) setItem(next);
  }

  function resetSection() {
    setContent((c) => ({ ...c, [active]: structuredClone(defaultHomepageContent[active]) }));
    setItem(0);
    setNotice(`${sectionName(active)} is back to the original Abeera copy. Save to publish it.`);
  }

  function restoreAll() {
    setContent(structuredClone(defaultHomepageContent));
    setItem(0);
    setNotice("Every section is back to the original Abeera copy. Save to publish it.");
  }

  function discard() {
    setContent(baseline);
    setClientError(null);
    setNotice(null);
  }

  function save() {
    const parsed = homepageContentSchema.safeParse(content);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.path[0];
      if (typeof first === "string" && SECTIONS.some((s) => s.key === first)) setActive(first as SectionKey);
      setClientError(homepageIssueMessage(parsed.error));
      return;
    }
    setClientError(null);
    setNotice(null);
    setContent(parsed.data);
    submitted.current = parsed.data;
    const formData = new FormData();
    formData.set("document", JSON.stringify(parsed.data));
    startTransition(() => formAction(formData));
  }

  const c = content;
  const id = (name: string) => `${active}-${name}`;

  const status = clientError
    ? { tone: "error", text: clientError }
    : state.status === "error"
      ? { tone: "error", text: state.message }
      : notice
        ? { tone: "muted", text: notice }
        : null;

  return (
    <div className="flex flex-col text-[#2b211c] lg:h-[calc(100dvh-4rem)]">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4 border-b border-[#e4dccf] pb-5">
        <div>
          <p className="text-xs text-[#8a7b6e]">Admin / Storefront</p>
          <h1 className="font-serif text-3xl font-normal">Homepage</h1>
          <p className="mt-1 text-[13px] text-[#8a7b6e]">
            Pick a section on the left, edit it, and check the preview before you publish.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={btn} onClick={restoreAll} disabled={pending}>
            Restore all defaults
          </button>
          <Link href="/" target="_blank" rel="noreferrer" className={btn}>
            View live site ↗
          </Link>
        </div>
      </header>

      {initial.source === "default" && !savedAt ? (
        <p className="mt-4 shrink-0 rounded-lg bg-[#efe6d8] px-4 py-2.5 text-[13px] text-[#5c4f45]">
          Nothing is saved yet — these fields match the current homepage. Publish to store them.
        </p>
      ) : null}

      <div className="mt-5 grid min-h-0 flex-1 gap-6 lg:grid-rows-[minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_minmax(340px,400px)]">
        <nav aria-label="Homepage sections" className="lg:overflow-y-auto">
          <p className="mb-2.5 px-2 text-[10px] tracking-[0.16em] text-[#8a7b6e] uppercase">Sections, top to bottom</p>
          <ol className="space-y-0.5">
            {SECTIONS.map((s, i) => {
              const on = s.key === active;
              const edited = changed.includes(s.key);
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => selectSection(s.key)}
                    aria-current={on ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition",
                      on ? "bg-white shadow-sm ring-1 ring-[#e4dccf]" : "hover:bg-white/60",
                    )}
                  >
                    <span className={cn("grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[11px]", on ? "bg-[#b08d57] text-white" : "bg-[#efe6d8] text-[#8a7b6e]")}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{s.name}</span>
                      <span className="block truncate text-[11px] text-[#8a7b6e]">{s.note(c)}</span>
                    </span>
                    <span
                      title={edited ? "Edited, not published" : "Published"}
                      className={cn("h-[7px] w-[7px] shrink-0 rounded-full", edited ? "bg-[#b08d57]" : "bg-[#9bb38a]")}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 px-2 text-[11px] leading-relaxed text-[#8a7b6e]">
            <span className="text-[#9bb38a]">●</span> Published &nbsp; <span className="text-[#b08d57]">●</span> Edited
          </p>
        </nav>

        <div className="min-w-0 space-y-4 pb-2 lg:overflow-y-auto lg:pr-1">
          {active === "hero" ? (
            <>
              <Card title="Hero banner" description="The first thing customers see. Keep the headline short — two lines looks best.">
                <Field id={id("eyebrow")} label="Small line above the headline" max={80} value={c.hero.eyebrow} onChange={(v) => patch("hero", { eyebrow: v })} help="Shown in small gold capitals, e.g. “Eid · Lahore”." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={id("lead")} label="Headline" max={80} value={c.hero.headlineLead} onChange={(v) => patch("hero", { headlineLead: v })} />
                  <Field id={id("emphasis")} label="Headline — gold italic part" max={80} optional value={c.hero.headlineEmphasis} onChange={(v) => patch("hero", { headlineEmphasis: v })} help="Second line, in italic gold. Leave empty to hide." />
                </div>
                <Field id={id("subline")} label="Short tagline" max={120} value={c.hero.subline} onChange={(v) => patch("hero", { subline: v })} />
                <Field id={id("body")} label="Paragraph" max={400} multiline value={c.hero.body} onChange={(v) => patch("hero", { body: v })} help="One or two sentences about the collection." />
              </Card>
              <Card title="Banner image" description="Use a tall portrait photo. The model's face should sit in the right half.">
                <ImageField id={id("image")} url={c.hero.imageUrl} alt={c.hero.imageAlt} onUrl={(v) => patch("hero", { imageUrl: v })} onAlt={(v) => patch("hero", { imageAlt: v })} />
              </Card>
              <Card title="Buttons" description="The two buttons on the banner and where each one takes the customer.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["primaryCta", "secondaryCta"] as const).map((k) => (
                    <div key={k} className="space-y-3 rounded-xl border border-[#e4dccf] p-3.5">
                      <p className="text-[10px] tracking-[0.14em] text-[#8a7b6e] uppercase">{k === "primaryCta" ? "Main button" : "Second button"}</p>
                      <Field id={id(`${k}-label`)} label="Button text" max={80} value={c.hero[k].label} onChange={(v) => patch("hero", { [k]: { ...c.hero[k], label: v } })} />
                      <LinkField id={id(`${k}-href`)} value={c.hero[k].href} onChange={(v) => patch("hero", { [k]: { ...c.hero[k], href: v } })} />
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : null}

          {active === "collections" ? (
            <>
              <Card title="Collection tiles" description="Big image links right under the hero. Use the arrows to reorder; you can have 1–6 tiles.">
                <ItemCards
                  items={c.collections}
                  noun="tile"
                  max={6}
                  selected={item}
                  onSelect={setItem}
                  onChange={(v, next) => setList("collections", v, next)}
                  createItem={blankTile}
                  getTitle={(t) => t.title}
                  getSubtitle={(t) => `${t.label} · ${describeLink(t.href)}`}
                  getImage={(t) => t.imageUrl}
                />
              </Card>
              {c.collections[item] ? (
                <ItemEditor
                  key={`tile-${item}`}
                  heading={`Editing: ${c.collections[item].title || `Tile ${item + 1}`}`}
                  prefix={id(`tile-${item}`)}
                  value={c.collections[item]}
                  onChange={(v) => setList("collections", c.collections.map((t, i) => (i === item ? { ...t, ...v } : t)))}
                  smallLabel
                />
              ) : null}
            </>
          ) : null}

          {active === "moments" ? (
            <>
              <Card title="Shop by moment" description="A row of cards that lead customers into parts of the catalog.">
                <Field id={id("kicker")} label="Small line above the title" max={80} value={c.moments.kicker} onChange={(v) => patch("moments", { kicker: v })} />
                <Field id={id("title")} label="Title" max={120} value={c.moments.title} onChange={(v) => patch("moments", { title: v })} />
                <Field id={id("lede")} label="Intro sentence" max={280} multiline rows={2} value={c.moments.lede} onChange={(v) => patch("moments", { lede: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={id("viewall")} label="“View all” link text" max={40} value={c.moments.viewAllLabel} onChange={(v) => patch("moments", { viewAllLabel: v })} />
                  <LinkField id={id("viewall-href")} label="“View all” goes to" value={c.moments.viewAllHref} onChange={(v) => patch("moments", { viewAllHref: v })} />
                </div>
                <Field id={id("cardcta")} label="Link text on each card" max={40} value={c.moments.cardCtaLabel} onChange={(v) => patch("moments", { cardCtaLabel: v })} help="e.g. “Shop now”." />
              </Card>
              <Card title="Cards" description="Click a card to edit it. Use the arrows to reorder; up to 8.">
                <ItemCards
                  items={c.moments.moments}
                  noun="card"
                  max={8}
                  selected={item}
                  onSelect={setItem}
                  onChange={(v, next) => {
                    patch("moments", { moments: v });
                    if (next !== undefined) setItem(next);
                  }}
                  createItem={blankMoment}
                  getTitle={(m) => m.title}
                  getSubtitle={(m) => describeLink(m.href)}
                  getImage={(m) => m.imageUrl}
                />
              </Card>
              {c.moments.moments[item] ? (
                <ItemEditor
                  key={`moment-${item}`}
                  heading={`Editing: ${c.moments.moments[item].title || `Card ${item + 1}`}`}
                  prefix={id(`moment-${item}`)}
                  value={c.moments.moments[item]}
                  copyMax={180}
                  onChange={(v) => patch("moments", { moments: c.moments.moments.map((m, i) => (i === item ? { ...m, ...v } : m)) })}
                />
              ) : null}
            </>
          ) : null}

          {active === "productRail" ? (
            <Card title="Bestsellers heading" description="The heading above the product row. The products themselves come from your catalog (marked as bestsellers).">
              <Field id={id("eyebrow")} label="Small line above the title" max={80} value={c.productRail.eyebrow} onChange={(v) => patch("productRail", { eyebrow: v })} />
              <Field id={id("title")} label="Title" max={120} value={c.productRail.title} onChange={(v) => patch("productRail", { title: v })} />
              <Field id={id("lede")} label="Intro sentence" max={280} multiline rows={2} value={c.productRail.lede} onChange={(v) => patch("productRail", { lede: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id={id("viewall")} label="“View all” link text" max={40} value={c.productRail.viewAllLabel} onChange={(v) => patch("productRail", { viewAllLabel: v })} />
                <LinkField id={id("href")} label="“View all” goes to" value={c.productRail.href} onChange={(v) => patch("productRail", { href: v })} />
              </div>
            </Card>
          ) : null}

          {active === "brandStory" ? (
            <>
              <Card title="Brand story" description="A short story about Abeera, next to a campaign photo.">
                <Field id={id("kicker")} label="Small line above the title" max={80} value={c.brandStory.kicker} onChange={(v) => patch("brandStory", { kicker: v })} />
                <Field id={id("title")} label="Title" max={180} multiline rows={2} value={c.brandStory.title} onChange={(v) => patch("brandStory", { title: v })} />
                <Field id={id("lede")} label="Opening line" max={280} value={c.brandStory.lede} onChange={(v) => patch("brandStory", { lede: v })} />
                <Field id={id("body")} label="Story" max={800} multiline rows={5} value={c.brandStory.body} onChange={(v) => patch("brandStory", { body: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={id("cta")} label="Link text" max={40} value={c.brandStory.ctaLabel} onChange={(v) => patch("brandStory", { ctaLabel: v })} />
                  <LinkField id={id("cta-href")} value={c.brandStory.ctaHref} onChange={(v) => patch("brandStory", { ctaHref: v })} />
                </div>
              </Card>
              <Card title="Story image" description="A landscape or square campaign photo works best.">
                <ImageField id={id("image")} url={c.brandStory.imageUrl} alt={c.brandStory.imageAlt} onUrl={(v) => patch("brandStory", { imageUrl: v })} onAlt={(v) => patch("brandStory", { imageAlt: v })} />
              </Card>
            </>
          ) : null}

          {active === "trust" ? (
            <Card title="Trust strip" description="Short promises shown in a row (delivery, exchanges, payment). Keep each one to a few words; up to 8.">
              <ItemCards
                items={c.trust}
                noun="promise"
                max={8}
                columns={2}
                onChange={(v) => setList("trust", v)}
                createItem={blankTrust}
                getTitle={(t) => t.title}
                renderBody={(t, i) => (
                  <div className="space-y-3">
                    <Field id={id(`${i}-title`)} label="Promise" max={80} value={t.title} onChange={(v) => setList("trust", c.trust.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
                    <Field id={id(`${i}-copy`)} label="Detail" max={180} value={t.copy} onChange={(v) => setList("trust", c.trust.map((x, j) => (j === i ? { ...x, copy: v } : x)))} />
                  </div>
                )}
              />
            </Card>
          ) : null}

          {active === "newsletter" ? (
            <>
              <Card title="Newsletter" description="The email sign-up block near the bottom of the page.">
                <Field id={id("title")} label="Title" max={120} value={c.newsletter.title} onChange={(v) => patch("newsletter", { title: v })} />
                <Field id={id("lede")} label="Intro sentence" max={280} multiline rows={2} value={c.newsletter.lede} onChange={(v) => patch("newsletter", { lede: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={id("placeholder")} label="Hint inside the email box" max={60} value={c.newsletter.placeholder} onChange={(v) => patch("newsletter", { placeholder: v })} />
                  <Field id={id("submit")} label="Button text" max={40} value={c.newsletter.submitLabel} onChange={(v) => patch("newsletter", { submitLabel: v })} />
                </div>
                <Field id={id("success")} label="Thank-you message" max={240} multiline rows={2} value={c.newsletter.successMessage} onChange={(v) => patch("newsletter", { successMessage: v })} help="Shown after someone signs up." />
              </Card>
              <Card title="Advanced" description="Rarely changed. Used for accessibility and while the form is sending.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={id("email")} label="Email box name (screen readers)" max={40} value={c.newsletter.emailLabel} onChange={(v) => patch("newsletter", { emailLabel: v })} />
                  <Field id={id("sending")} label="Button text while sending" max={40} value={c.newsletter.sendingLabel} onChange={(v) => patch("newsletter", { sendingLabel: v })} />
                </div>
              </Card>
            </>
          ) : null}

          {active === "lookbook" ? (
            <>
              <Card title="Lookbook" description="Only appears when the bestsellers row has no products to show — a backup so the page never looks empty.">
                <Field id={id("kicker")} label="Small line above the title" max={80} value={c.lookbook.kicker} onChange={(v) => patch("lookbook", { kicker: v })} />
                <Field id={id("title")} label="Title" max={120} value={c.lookbook.title} onChange={(v) => patch("lookbook", { title: v })} />
                <Field id={id("lede")} label="Intro sentence" max={320} multiline rows={2} value={c.lookbook.lede} onChange={(v) => patch("lookbook", { lede: v })} />
                <Field id={id("cardcta")} label="Link text on each card" max={40} value={c.lookbook.cardCtaLabel} onChange={(v) => patch("lookbook", { cardCtaLabel: v })} />
              </Card>
              <Card title="Lookbook cards" description="Click a card to edit it; up to 6.">
                <ItemCards
                  items={c.lookbook.edits}
                  noun="card"
                  max={6}
                  selected={item}
                  onSelect={setItem}
                  onChange={(v, next) => {
                    patch("lookbook", { edits: v });
                    if (next !== undefined) setItem(next);
                  }}
                  createItem={blankEdit}
                  getTitle={(e) => e.title}
                  getSubtitle={(e) => describeLink(e.href)}
                  getImage={(e) => e.imageUrl}
                />
              </Card>
              {c.lookbook.edits[item] ? (
                <ItemEditor
                  key={`edit-${item}`}
                  heading={`Editing: ${c.lookbook.edits[item].title || `Card ${item + 1}`}`}
                  prefix={id(`edit-${item}`)}
                  value={c.lookbook.edits[item]}
                  copyMax={240}
                  onChange={(v) => patch("lookbook", { edits: c.lookbook.edits.map((e, i) => (i === item ? { ...e, ...v } : e)) })}
                />
              ) : null}
            </>
          ) : null}
        </div>

        <aside className="hidden xl:block xl:overflow-y-auto">
          <div className="rounded-xl bg-[#f3eee6] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] tracking-[0.16em] text-[#8a7b6e] uppercase">Live preview</p>
              <div className="flex rounded-md border border-[#e4dccf] bg-white p-0.5" role="group" aria-label="Preview size">
                {(["Desktop", "Mobile"] as const).map((label) => {
                  const on = (label === "Mobile") === mobile;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setMobile(label === "Mobile")}
                      className={cn("rounded px-2.5 py-1 text-[11px]", on ? "bg-[#2b211c] text-white" : "text-[#2b211c]")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={cn("mx-auto overflow-hidden rounded-xl bg-[#faf7f2] shadow-[0_8px_24px_rgba(43,33,28,0.1)] transition-all", mobile ? "max-w-[260px]" : "w-full")}>
              <div className="flex h-5 items-center gap-1 bg-[#e9e2d6] px-2.5">
                <i className="h-1.5 w-1.5 rounded-full bg-[#cfc3b2]" />
                <i className="h-1.5 w-1.5 rounded-full bg-[#cfc3b2]" />
                <i className="h-1.5 w-1.5 rounded-full bg-[#cfc3b2]" />
              </div>
              <div>
                <HomepagePreview content={c} section={active} mobile={mobile} selected={item} />
              </div>
            </div>
            <p className="mt-2.5 text-[11px] text-[#8a7b6e]">Updates as you type. Nothing goes live until you publish.</p>
          </div>
        </aside>
      </div>

      <div className="z-20 mt-4 flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-[#e4dccf] bg-white/95 px-5 py-3 shadow-[0_8px_30px_rgba(43,33,28,0.12)] backdrop-blur">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 text-[13px]" aria-live="polite">
          {status?.tone === "error" ? (
            <span className="text-red-700">{status.text}</span>
          ) : dirty ? (
            <>
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#b08d57]" />
              <b className="font-medium">
                {changed.length} unsaved {changed.length === 1 ? "change" : "changes"}
              </b>
              <span className="truncate text-[#8a7b6e]">· {changed.map(sectionName).join(", ")}</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#9bb38a]" />
              <span className="text-[#8a7b6e]">
                {state.status === "saved" ? "Published. " : "All changes published. "}
                {savedAt ? `Last saved ${savedAt}.` : ""}
              </span>
            </>
          )}
          {status?.tone === "muted" && dirty ? <span className="hidden truncate text-[#8a7b6e] 2xl:inline">{status.text}</span> : null}
        </div>
        <button type="button" className={cn(btn, "border-transparent bg-transparent text-[#8a7b6e]")} onClick={discard} disabled={!dirty || pending}>
          Discard
        </button>
        <button type="button" className={btn} onClick={resetSection} disabled={pending}>
          Reset this section
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-lg bg-[#2b211c] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#3d312a] disabled:opacity-40"
        >
          {pending ? "Publishing…" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}

type LinkedItem = { title: string; href: string; imageUrl: string; imageAlt: string; label?: string; copy?: string };

function ItemEditor<T extends LinkedItem>({
  heading,
  prefix,
  value,
  onChange,
  smallLabel = false,
  copyMax,
}: {
  heading: string;
  prefix: string;
  value: T;
  onChange: (value: Partial<T>) => void;
  smallLabel?: boolean;
  copyMax?: number;
}) {
  return (
    <Card title={heading} description="Details for the card you selected above.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${prefix}-title`} label="Title" max={80} value={value.title} onChange={(v) => onChange({ title: v } as Partial<T>)} />
        {smallLabel ? (
          <Field id={`${prefix}-label`} label="Small label" max={80} value={value.label ?? ""} onChange={(v) => onChange({ label: v } as Partial<T>)} help="Shown above the title, e.g. “Ready to wear”." />
        ) : (
          <LinkField id={`${prefix}-href`} value={value.href} onChange={(v) => onChange({ href: v } as Partial<T>)} />
        )}
      </div>
      {copyMax ? (
        <Field id={`${prefix}-copy`} label="Short description" max={copyMax} multiline rows={2} value={value.copy ?? ""} onChange={(v) => onChange({ copy: v } as Partial<T>)} />
      ) : null}
      {smallLabel ? <LinkField id={`${prefix}-href`} value={value.href} onChange={(v) => onChange({ href: v } as Partial<T>)} /> : null}
      <ImageField id={`${prefix}-image`} url={value.imageUrl} alt={value.imageAlt} onUrl={(v) => onChange({ imageUrl: v } as Partial<T>)} onAlt={(v) => onChange({ imageAlt: v } as Partial<T>)} />
    </Card>
  );
}

