"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  CARD_GATEWAY_CONNECTED,
  defaultSiteSettings,
  siteIssueMessage,
  siteSettingsSchema,
  type MenuLink,
  type SiteDocumentResponse,
  type SiteSettings,
} from "@abeera/shared";

import { AdminHeader, Notice, SaveBar, Toggle, ToggleRow, btnClass, type SaveTone } from "@/components/admin/admin-ui";
import { Card, Field, ImageField, inputClass, isSafeLink } from "@/components/admin/homepage-fields";
import { saveSiteSettingsAction } from "@/lib/admin/site";
import { cn } from "@/lib/utils";

type Tab = "navigation" | "announcement" | "footer" | "store" | "seo";
const TABS: { key: Tab; label: string }[] = [
  { key: "navigation", label: "Navigation menu" },
  { key: "announcement", label: "Announcement bar" },
  { key: "footer", label: "Footer" },
  { key: "store", label: "Store info" },
  { key: "seo", label: "SEO" },
];

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const rupees = (paisa: number) => String(paisa / 100);
const toPaisa = (value: string) => Math.max(0, Math.round((Number(value) || 0) * 100));

function when(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function move<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

const miniBtn = "grid h-7 w-7 place-items-center rounded-md border border-[#e4dccf] bg-white text-[11px] disabled:opacity-30";

function LinkRows<T extends { label: string; href: string; visible?: boolean }>({
  items,
  onChange,
  max,
  create,
  noun = "link",
  withVisible = false,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  max: number;
  create: () => T;
  noun?: string;
  withVisible?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const ok = isSafeLink(item.href);
        return (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#efe6d8] bg-[#fcfaf6] p-2">
            <span className="w-5 text-center text-[11px] text-[#8a7b6e]">{i + 1}</span>
            <input aria-label={`${noun} ${i + 1} label`} value={item.label} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={cn(inputClass, "h-9 w-40 bg-white", !item.label.trim() && "border-red-300")} />
            <input aria-label={`${noun} ${i + 1} link`} value={item.href} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, href: e.target.value.trim() } : x)))} className={cn(inputClass, "h-9 min-w-40 flex-1 bg-white font-mono text-[12px]", !ok && "border-red-300")} />
            {withVisible ? <Toggle checked={item.visible !== false} onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, visible: v } : x)))} label={`Show ${item.label || noun}`} /> : null}
            <button type="button" aria-label={`Move ${noun} ${i + 1} up`} className={miniBtn} disabled={i === 0} onClick={() => onChange(move(items, i, -1))}>↑</button>
            <button type="button" aria-label={`Move ${noun} ${i + 1} down`} className={miniBtn} disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))}>↓</button>
            <button type="button" aria-label={`Remove ${noun} ${i + 1}`} className={cn(miniBtn, "hover:text-red-700")} onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
          </div>
        );
      })}
      <button type="button" className={btnClass} disabled={items.length >= max} onClick={() => onChange([...items, create()])}>
        + Add {noun}
      </button>
    </div>
  );
}

function MoneyField({ id, label, value, onChange, help }: { id: string; label: string; value: number; onChange: (v: number) => void; help?: string }) {
  const [text, setText] = useState(rupees(value));
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-[#2b211c]">{label}</label>
      <div className="flex items-center rounded-lg border border-[#e4dccf] bg-[#faf7f2] pl-3 text-[12px] text-[#8a7b6e] focus-within:border-[#b08d57]">
        Rs
        <input
          id={id}
          inputMode="numeric"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(toPaisa(e.target.value));
          }}
          className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-[#2b211c] tabular-nums outline-none"
        />
      </div>
      {help ? <p className="mt-1 text-[11px] text-[#8a7b6e]">{help}</p> : null}
    </div>
  );
}

export function SiteSettingsForm({ initial, whatsappEnv }: { initial: SiteDocumentResponse<SiteSettings>; whatsappEnv: string }) {
  const [s, setS] = useState<SiteSettings>(initial.content);
  const [baseline, setBaseline] = useState<SiteSettings>(initial.content);
  const [tab, setTab] = useState<Tab>("navigation");
  const [tone, setTone] = useState<SaveTone>("idle");
  const [message, setMessage] = useState(initial.updatedAt ? `All changes saved. Last saved ${when(initial.updatedAt)}.` : "Using the original Abeera settings.");
  const [pending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  const changed = TABS.filter((t) => !same(s[t.key], baseline[t.key]));
  const dirty = changed.length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patch<K extends keyof SiteSettings>(key: K, value: Partial<SiteSettings[K]>) {
    setS((c) => ({ ...c, [key]: { ...c[key], ...value } }));
    setTone("idle");
  }

  function save() {
    const parsed = siteSettingsSchema.safeParse(s);
    if (!parsed.success) {
      setTone("error");
      setMessage(siteIssueMessage(parsed.error));
      return;
    }
    startTransition(async () => {
      const res = await saveSiteSettingsAction(parsed.data);
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

  const nav = s.navigation;
  const store = s.store;
  const blankLink = (): MenuLink => ({ label: "New link", href: "/", visible: true });

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }, { label: "Site settings" }]}
        title="Site settings"
        description="Menu, announcement bar, footer, delivery and payments, and how the site appears in Google."
        action={
          <Link href="/" target="_blank" className={btnClass}>
            View live site ↗
          </Link>
        }
      />

      <div role="tablist" aria-label="Settings sections" className="mb-5 flex flex-wrap gap-1 border-b border-[#e4dccf]">
        {TABS.map((t) => {
          const on = tab === t.key;
          const isDirty = changed.some((c) => c.key === t.key);
          return (
            <button key={t.key} role="tab" aria-selected={on} type="button" onClick={() => setTab(t.key)} className={cn("-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-[13px]", on ? "border-[#2b211c] text-[#2b211c]" : "border-transparent text-[#8a7b6e] hover:text-[#2b211c]")}>
              {t.label}
              {isDirty ? <span className="h-1.5 w-1.5 rounded-full bg-[#b08d57]" aria-label="unsaved" /> : null}
            </button>
          );
        })}
      </div>

      <div key={formKey} className="max-w-4xl space-y-5">
        {tab === "navigation" ? (
          <>
            <Card title="Main menu" description="The menu that slides out from the ☰ button on every page. Large links come first.">
              <LinkRows items={nav.primary} onChange={(v) => patch("navigation", { primary: v })} max={12} create={blankLink} withVisible />
            </Card>
            <Card title="Categories in the menu">
              <ToggleRow label="List every category after the large links" help="Uses the order from Catalog → Categories." checked={nav.showCategories} onChange={(v) => patch("navigation", { showCategories: v })} />
            </Card>
            <Card title="Small links" description="Shown under the large links.">
              <LinkRows items={nav.secondary} onChange={(v) => patch("navigation", { secondary: v })} max={12} create={blankLink} withVisible />
            </Card>
            <Card title="Under the logo">
              <Field id="nav-tagline" label="Small line under “Abeera”" max={40} optional value={nav.tagline} onChange={(v) => patch("navigation", { tagline: v })} />
            </Card>
          </>
        ) : null}

        {tab === "announcement" ? (
          <Card title="Announcement bar" description="The scrolling strip above the header on every page.">
            <ToggleRow label="Show the announcement bar" checked={s.announcement.enabled} onChange={(v) => patch("announcement", { enabled: v })} />
            <div className="space-y-2">
              {s.announcement.messages.map((m, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#efe6d8] bg-[#fcfaf6] p-2">
                  <span className="w-5 text-center text-[11px] text-[#8a7b6e]">{i + 1}</span>
                  <input aria-label={`Message ${i + 1}`} value={m.text} maxLength={80} onChange={(e) => patch("announcement", { messages: s.announcement.messages.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} className={cn(inputClass, "h-9 min-w-48 flex-1 bg-white", !m.text.trim() && "border-red-300")} />
                  <input aria-label={`Message ${i + 1} link`} value={m.href} placeholder="Link (optional)" onChange={(e) => patch("announcement", { messages: s.announcement.messages.map((x, j) => (j === i ? { ...x, href: e.target.value.trim() } : x)) })} className={cn(inputClass, "h-9 w-48 bg-white font-mono text-[12px]", m.href && !isSafeLink(m.href) && "border-red-300")} />
                  <button type="button" aria-label={`Move message ${i + 1} up`} className={miniBtn} disabled={i === 0} onClick={() => patch("announcement", { messages: move(s.announcement.messages, i, -1) })}>↑</button>
                  <button type="button" aria-label={`Move message ${i + 1} down`} className={miniBtn} disabled={i === s.announcement.messages.length - 1} onClick={() => patch("announcement", { messages: move(s.announcement.messages, i, 1) })}>↓</button>
                  <button type="button" aria-label={`Remove message ${i + 1}`} className={cn(miniBtn, "hover:text-red-700")} disabled={s.announcement.messages.length <= 1} onClick={() => patch("announcement", { messages: s.announcement.messages.filter((_, j) => j !== i) })}>✕</button>
                </div>
              ))}
              <button type="button" className={btnClass} disabled={s.announcement.messages.length >= 8} onClick={() => patch("announcement", { messages: [...s.announcement.messages, { text: "New message", href: "" }] })}>
                + Add message
              </button>
            </div>
            <div className="overflow-hidden rounded-lg bg-[#2b211c] py-2 text-center text-[10px] tracking-[0.16em] text-[#e9dcc3] uppercase">
              {s.announcement.enabled ? s.announcement.messages.map((m) => m.text).join("   ·   ") : "Hidden"}
            </div>
          </Card>
        ) : null}

        {tab === "footer" ? (
          <>
            <Card title="About line">
              <Field id="footer-blurb" label="Short description under the logo" max={400} optional multiline rows={3} value={s.footer.blurb} onChange={(v) => patch("footer", { blurb: v })} />
            </Card>
            {s.footer.columns.map((col, ci) => (
              <Card
                key={ci}
                title={`Column ${ci + 1}: ${col.title || "Untitled"}`}
                action={
                  <button type="button" className={cn(btnClass, "text-red-700")} onClick={() => patch("footer", { columns: s.footer.columns.filter((_, j) => j !== ci) })}>
                    Remove column
                  </button>
                }
              >
                <Field id={`col-${ci}`} label="Heading" max={30} value={col.title} onChange={(v) => patch("footer", { columns: s.footer.columns.map((c, j) => (j === ci ? { ...c, title: v } : c)) })} />
                <LinkRows items={col.links} onChange={(v) => patch("footer", { columns: s.footer.columns.map((c, j) => (j === ci ? { ...c, links: v } : c)) })} max={10} create={() => ({ label: "New link", href: "/" })} />
              </Card>
            ))}
            <button type="button" className={btnClass} disabled={s.footer.columns.length >= 4} onClick={() => patch("footer", { columns: [...s.footer.columns, { title: "New column", links: [] }] })}>
              + Add column
            </button>
            <Card title="Bottom line">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="footer-name" label="Name after ©" max={60} value={s.footer.copyrightName} onChange={(v) => patch("footer", { copyrightName: v })} help={`Shows “© ${new Date().getFullYear()} ${s.footer.copyrightName}”`} />
                <Field id="footer-loc" label="Location" max={80} optional value={s.footer.location} onChange={(v) => patch("footer", { location: v })} />
              </div>
            </Card>
          </>
        ) : null}

        {tab === "store" ? (
          <>
            <Card title="Delivery" description="Used by checkout and when the order is placed.">
              <div className="grid gap-4 sm:grid-cols-3">
                <MoneyField id="ship-std" label="Standard delivery" value={store.standardShipping} onChange={(v) => patch("store", { standardShipping: v })} />
                <MoneyField id="ship-exp" label="Express delivery" value={store.expressShipping} onChange={(v) => patch("store", { expressShipping: v })} />
                <MoneyField id="ship-free" label="Free standard delivery over" value={store.freeShippingThreshold} onChange={(v) => patch("store", { freeShippingThreshold: v })} help="0 turns free delivery off." />
              </div>
              <p className="text-[11px] text-[#8a7b6e]">Remember to update the announcement bar and the Shipping page text if you change these.</p>
            </Card>
            <Card title="Payments" description="Only methods switched on here appear at checkout. Orders using anything else are refused.">
              <ToggleRow label="Cash on delivery" help="Customer pays the rider." checked={store.payments.cod} onChange={(v) => patch("store", { payments: { ...store.payments, cod: v } })} />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-[#2b211c]">Card payment</p>
                  <p className="text-[11px] text-[#9a6b1f]">Needs a card gateway - not connected yet</p>
                </div>
                <Toggle checked={store.payments.card} onChange={(v) => patch("store", { payments: { ...store.payments, card: v } })} label="Card payment" />
              </div>
              {store.payments.card && !CARD_GATEWAY_CONNECTED ? (
                <Notice tone="warn">Card stays hidden at checkout until a card gateway is connected. Switching it on now only remembers your choice.</Notice>
              ) : null}
              {!store.payments.cod && !(store.payments.card && CARD_GATEWAY_CONNECTED) ? (
                <Notice tone="warn">No payment method is available, so customers can&apos;t place orders.</Notice>
              ) : null}
            </Card>
            <Card title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="wa" label="WhatsApp number" max={20} optional value={store.whatsappNumber} onChange={(v) => patch("store", { whatsappNumber: v })} help={whatsappEnv ? `Empty uses the number set in the environment (${whatsappEnv}).` : "With country code, e.g. 923001234567. Used by the green WhatsApp button and product pages."} />
                <Field id="phone" label="Phone" max={30} optional value={store.contactPhone} onChange={(v) => patch("store", { contactPhone: v })} />
                <Field id="email" label="Contact email" max={120} optional value={store.contactEmail} onChange={(v) => patch("store", { contactEmail: v })} />
                <Field id="order-email" label="Order notification email" max={160} value={store.orderNotificationEmail} onChange={(v) => patch("store", { orderNotificationEmail: v })} help="Every new order sends a 'New order' email here." />
                <Field id="address" label="Shop / office address" max={200} optional value={store.address} onChange={(v) => patch("store", { address: v })} help="Shown on the contact, terms and ownership pages. Safepay needs a Pakistani address." />
              </div>
            </Card>
          </>
        ) : null}

        {tab === "seo" ? (
          <>
            <Card title="Search results" description="How pages appear in Google. Individual pages fill in their own name.">
              <Field id="seo-title" label="Homepage title" max={70} value={s.seo.defaultTitle} onChange={(v) => patch("seo", { defaultTitle: v })} />
              <Field id="seo-template" label="Title for other pages" max={70} value={s.seo.titleTemplate} onChange={(v) => patch("seo", { titleTemplate: v })} help={`%s is replaced by the page name, e.g. “${s.seo.titleTemplate.replace("%s", "Shop")}”.`} />
              <Field id="seo-desc" label="Description" max={200} multiline rows={3} value={s.seo.description} onChange={(v) => patch("seo", { description: v })} />
              <div className="rounded-lg border border-[#efe6d8] bg-white p-3">
                <p className="text-[12px] text-[#5f7d4e]">abeera.pk</p>
                <p className="text-[17px] text-[#1a0dab]">{s.seo.defaultTitle}</p>
                <p className="text-[12px] text-[#4d5156]">{s.seo.description}</p>
              </div>
            </Card>
            <Card title="When shared" description="WhatsApp, Facebook and Instagram link previews.">
              <Field id="seo-share" label="Share description" max={200} multiline rows={2} value={s.seo.shareDescription} onChange={(v) => patch("seo", { shareDescription: v })} />
              <ImageField id="seo-image" url={s.seo.shareImage} alt="Abeera" onUrl={(v) => patch("seo", { shareImage: v })} showAlt={false}
                optional help="Optional. 1200 × 630 works best." />
            </Card>
          </>
        ) : null}
      </div>

      <SaveBar
        dirtyLabels={changed.map((c) => c.label)}
        message={message}
        tone={tone}
        pending={pending}
        onDiscard={() => {
          setS(baseline);
          setFormKey((k) => k + 1);
          setTone("idle");
        }}
        onSave={save}
        extra={
          <button
            type="button"
            className={cn(btnClass, "border-transparent bg-transparent text-[#8a7b6e]")}
            disabled={pending}
            onClick={() => {
              setS((c) => ({ ...c, [tab]: structuredClone(defaultSiteSettings[tab]) }));
              setFormKey((k) => k + 1);
            }}
          >
            Reset this tab
          </button>
        }
      />
    </div>
  );
}
