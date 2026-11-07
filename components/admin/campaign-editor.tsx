"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminHeader, Notice, SaveBar, ToggleRow, btnClass } from "@/components/admin/admin-ui";
import { Card, inputClass } from "@/components/admin/homepage-fields";
import {
  deleteCampaignAction,
  endCampaignAction,
  saveCampaignAction,
  type CampaignScope,
  type CampaignStatus,
  type DiscountKind,
  type SaleCampaign,
} from "@/lib/admin/sales";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string; detail?: string };

type Draft = {
  name: string;
  discountType: DiscountKind;
  amount: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  scope: CampaignScope;
  categoryIds: string[];
  productIds: string[];
  bannerText: string;
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  live: "Live",
  scheduled: "Scheduled",
  ended: "Ended",
  paused: "Paused",
};

function toLocalInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultDraft(): Draft {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return {
    name: "",
    discountType: "PERCENT",
    amount: "10",
    startsAt: toLocalInput(start.toISOString()),
    endsAt: toLocalInput(end.toISOString()),
    active: true,
    scope: "ALL",
    categoryIds: [],
    productIds: [],
    bannerText: "",
  };
}

function fromCampaign(campaign: SaleCampaign): Draft {
  return {
    name: campaign.name,
    discountType: campaign.discountType,
    amount: campaign.discountType === "PERCENT" ? String(campaign.amount) : String(campaign.amount / 100),
    startsAt: toLocalInput(campaign.startsAt),
    endsAt: toLocalInput(campaign.endsAt),
    active: campaign.active,
    scope: campaign.scope,
    categoryIds: campaign.categoryIds,
    productIds: campaign.productIds,
    bannerText: campaign.bannerText,
  };
}

export function CampaignEditor({
  campaign,
  categories,
  products,
}: {
  campaign: SaleCampaign | null;
  categories: Option[];
  products: Option[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(campaign ? fromCampaign(campaign) : defaultDraft());
  const [baseline, setBaseline] = useState<Draft>(campaign ? fromCampaign(campaign) : defaultDraft());
  const [status, setStatus] = useState<CampaignStatus | null>(campaign?.status ?? null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"idle" | "saved" | "error">("idle");
  const [query, setQuery] = useState("");

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const choices = draft.scope === "CATEGORIES" ? categories : products;
  const selected = draft.scope === "CATEGORIES" ? draft.categoryIds : draft.productIds;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return choices;
    return choices.filter((option) => `${option.name} ${option.detail ?? ""}`.toLowerCase().includes(q));
  }, [choices, query]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleId(id: string) {
    const key = draft.scope === "CATEGORIES" ? "categoryIds" : "productIds";
    const list = draft[key];
    set(key, list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  async function save() {
    setTone("idle");
    const amountNumber = Number(draft.amount);
    if (!draft.name.trim()) return fail("Name is required.");
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) return fail("Enter a discount greater than 0.");
    if (draft.discountType === "PERCENT" && amountNumber > 100) return fail("Percent off can't be more than 100.");
    if (!draft.startsAt || !draft.endsAt) return fail("Start and end are required.");
    if (new Date(draft.endsAt).getTime() <= new Date(draft.startsAt).getTime()) return fail("The end must be after the start.");
    if (draft.scope === "CATEGORIES" && draft.categoryIds.length === 0) return fail("Choose at least one category.");
    if (draft.scope === "PRODUCTS" && draft.productIds.length === 0) return fail("Choose at least one product.");

    setPending(true);
    const result = await saveCampaignAction(campaign?.id, {
      name: draft.name.trim(),
      discountType: draft.discountType,
      amount: draft.discountType === "PERCENT" ? Math.round(amountNumber) : Math.round(amountNumber * 100),
      startsAt: new Date(draft.startsAt).toISOString(),
      endsAt: new Date(draft.endsAt).toISOString(),
      active: draft.active,
      scope: draft.scope,
      categoryIds: draft.scope === "CATEGORIES" ? draft.categoryIds : [],
      productIds: draft.scope === "PRODUCTS" ? draft.productIds : [],
      bannerText: draft.bannerText.trim(),
    });
    setPending(false);
    if (!result.ok) return fail(result.error);
    setBaseline(fromCampaign(result.data));
    setDraft(fromCampaign(result.data));
    setStatus(result.data.status);
    setTone("saved");
    setMessage("Saved. The shop prices follow this sale while it is live.");
    if (!campaign) router.push(`/admin/sales/${result.data.id}`);
  }

  async function endNow() {
    if (!campaign) return;
    setPending(true);
    const result = await endCampaignAction(campaign.id);
    setPending(false);
    if (!result.ok) return fail(result.error);
    const next = fromCampaign(result.data);
    setDraft(next);
    setBaseline(next);
    setStatus(result.data.status);
    setTone("saved");
    setMessage("Ended. Prices are back to the regular amount.");
    router.refresh();
  }

  function fail(text: string) {
    setTone("error");
    setMessage(text);
  }

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Sales", href: "/admin/sales" }]}
        title={campaign ? campaign.name : "New sale"}
        description="Percent or a fixed amount off, between a start and an end. The shop turns it on and off from those dates."
        action={
          status ? (
            <span className="rounded-full bg-[#faf7f2] px-3 py-1 text-[11px] tracking-[0.14em] text-[#6b5326] uppercase">
              {STATUS_LABEL[status]}
            </span>
          ) : null
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card title="Discount" description="If two sales both apply, the customer pays the lower price. They do not stack.">
            <label className="block text-[13px] font-medium text-[#2b211c]" htmlFor="sale-name">
              Name
            </label>
            <input id="sale-name" value={draft.name} maxLength={80} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="Eid edit" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="sale-type">
                  Type
                </label>
                <select id="sale-type" value={draft.discountType} onChange={(e) => set("discountType", e.target.value as DiscountKind)} className={cn(inputClass, "h-10")}>
                  <option value="PERCENT">Percent off</option>
                  <option value="FIXED">Fixed amount (Rs)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="sale-amount">
                  {draft.discountType === "PERCENT" ? "Percent" : "Rupees off"}
                </label>
                <input id="sale-amount" inputMode="decimal" value={draft.amount} onChange={(e) => set("amount", e.target.value)} className={cn(inputClass, "h-10 tabular-nums")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="sale-start">
                  Starts
                </label>
                <input id="sale-start" type="datetime-local" value={draft.startsAt} onChange={(e) => set("startsAt", e.target.value)} className={cn(inputClass, "h-10")} />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="sale-end">
                  Ends
                </label>
                <input id="sale-end" type="datetime-local" value={draft.endsAt} onChange={(e) => set("endsAt", e.target.value)} className={cn(inputClass, "h-10")} />
              </div>
            </div>
            <ToggleRow label="Active" help="Off pauses the sale even inside the dates. On does not start it early." checked={draft.active} onChange={(value) => set("active", value)} />
            {campaign && (status === "live" || status === "scheduled") ? (
              <button type="button" className={btnClass} disabled={pending} onClick={() => void endNow()}>
                End now
              </button>
            ) : null}
          </Card>

          <Card title="Applies to" description="All products, chosen categories, or chosen products.">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["ALL", "All products"],
                  ["CATEGORIES", "Categories"],
                  ["PRODUCTS", "Products"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={draft.scope === value}
                  onClick={() => set("scope", value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px]",
                    draft.scope === value ? "border-[#2b211c] bg-[#2b211c] text-white" : "border-[#e4dccf] bg-white text-[#2b211c]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {draft.scope === "ALL" ? (
              <Notice>Every product in the shop is included while this sale is live.</Notice>
            ) : (
              <div>
                <input
                  aria-label={draft.scope === "CATEGORIES" ? "Search categories" : "Search products"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className={cn(inputClass, "mb-3 h-10")}
                />
                <ul className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-[#e4dccf] p-2">
                  {filtered.length === 0 ? <li className="px-2 py-3 text-[13px] text-[#8a7b6e]">Nothing matches.</li> : null}
                  {filtered.map((option) => {
                    const on = selected.includes(option.id);
                    return (
                      <li key={option.id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-[#faf7f2]">
                          <input type="checkbox" checked={on} onChange={() => toggleId(option.id)} />
                          <span className="text-[13px] text-[#2b211c]">
                            {option.name}
                            {option.detail ? <span className="ml-2 text-[#8a7b6e]">{option.detail}</span> : null}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-[11px] text-[#8a7b6e]">{selected.length} selected</p>
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Banner" description="Optional line shown across the shop while this sale is the one on display. Leave it blank to show no banner.">
            <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="sale-banner">
              Banner text
            </label>
            <textarea
              id="sale-banner"
              value={draft.bannerText}
              maxLength={180}
              rows={3}
              onChange={(e) => set("bannerText", e.target.value)}
              placeholder="Eid edit — 20% off selected pret"
              className={inputClass}
            />
            <p className="text-[11px] text-[#8a7b6e]">{draft.bannerText.length}/180 · links to the Sale view</p>
          </Card>
          {campaign ? (
            <Card title="Remove">
              <form action={deleteCampaignAction.bind(null, campaign.id)}>
                <button type="submit" className={btnClass}>
                  Delete this sale
                </button>
              </form>
            </Card>
          ) : (
            <Notice>
              <Link href="/admin/promos" className="underline">
                Promo codes
              </Link>{" "}
              are separate — they apply at checkout, not on the product price.
            </Notice>
          )}
        </aside>
      </div>

      <SaveBar
        dirtyLabels={dirty ? ["Sale"] : []}
        message={message || (campaign ? "All changes saved." : "Set the discount, then create the sale.")}
        tone={tone}
        pending={pending}
        onDiscard={() => {
          setDraft(baseline);
          setTone("idle");
          setMessage("");
        }}
        onSave={() => void save()}
        saveLabel={campaign ? "Save sale" : "Create sale"}
      />
    </div>
  );
}
