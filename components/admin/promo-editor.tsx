"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminHeader, Notice, SaveBar, ToggleRow, btnClass } from "@/components/admin/admin-ui";
import { Card, inputClass } from "@/components/admin/homepage-fields";
import { deletePromoAction, savePromoAction, type DiscountKind, type PromoCode } from "@/lib/admin/sales";
import { cn, formatPrice } from "@/lib/utils";

type Draft = {
  code: string;
  discountType: DiscountKind;
  amount: string;
  minSubtotal: string;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  active: boolean;
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromPromo(promo: PromoCode): Draft {
  return {
    code: promo.code,
    discountType: promo.discountType,
    amount: promo.discountType === "PERCENT" ? String(promo.amount) : String(promo.amount / 100),
    minSubtotal: promo.minSubtotal ? String(promo.minSubtotal / 100) : "",
    startsAt: toLocalInput(promo.startsAt),
    expiresAt: toLocalInput(promo.expiresAt),
    usageLimit: promo.usageLimit == null ? "" : String(promo.usageLimit),
    active: promo.active,
  };
}

const empty: Draft = {
  code: "",
  discountType: "PERCENT",
  amount: "10",
  minSubtotal: "",
  startsAt: "",
  expiresAt: "",
  usageLimit: "",
  active: true,
};

export function PromoEditor({ promo }: { promo: PromoCode | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(promo ? fromPromo(promo) : empty);
  const [baseline, setBaseline] = useState<Draft>(promo ? fromPromo(promo) : empty);
  const [usedCount, setUsedCount] = useState(promo?.usedCount ?? 0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"idle" | "saved" | "error">("idle");
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    const amountNumber = Number(draft.amount);
    const minNumber = draft.minSubtotal.trim() ? Number(draft.minSubtotal) : 0;
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,39}$/.test(draft.code.trim())) {
      return fail("Code must be 2–40 letters, numbers, dashes or underscores.");
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) return fail("Enter a discount greater than 0.");
    if (draft.discountType === "PERCENT" && amountNumber > 100) return fail("Percent off can't be more than 100.");
    if (!Number.isFinite(minNumber) || minNumber < 0) return fail("Minimum order must be 0 or more.");
    if (draft.startsAt && draft.expiresAt && new Date(draft.expiresAt).getTime() <= new Date(draft.startsAt).getTime()) {
      return fail("Expiry must be after the start.");
    }
    let usageLimit: number | null = null;
    if (draft.usageLimit.trim()) {
      usageLimit = Number(draft.usageLimit);
      if (!Number.isInteger(usageLimit) || usageLimit < 1) return fail("Usage limit must be at least 1, or left empty.");
    }

    setPending(true);
    const result = await savePromoAction(promo?.id, {
      code: draft.code.trim().toUpperCase(),
      discountType: draft.discountType,
      amount: draft.discountType === "PERCENT" ? Math.round(amountNumber) : Math.round(amountNumber * 100),
      minSubtotal: Math.round(minNumber * 100),
      startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
      expiresAt: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
      usageLimit,
      active: draft.active,
    });
    setPending(false);
    if (!result.ok) return fail(result.error);
    const next = fromPromo(result.data);
    setDraft(next);
    setBaseline(next);
    setUsedCount(result.data.usedCount);
    setTone("saved");
    setMessage("Saved. Checkout checks this code on the server.");
    if (!promo) router.push(`/admin/promos/${result.data.id}`);
  }

  function fail(text: string) {
    setTone("error");
    setMessage(text);
  }

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Promo codes", href: "/admin/promos" }]}
        title={promo ? promo.code : "New promo code"}
        description="Taken off the order total at checkout. Inactive, expired, used-up, and below-minimum codes are refused."
        action={
          <Link href="/admin/sales" className={btnClass}>
            Sales
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card title="Code" description="Customers type this at checkout. Letters are saved in capitals.">
          <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="promo-code">
            Code
          </label>
          <input id="promo-code" value={draft.code} onChange={(e) => set("code", e.target.value.toUpperCase())} className={cn(inputClass, "h-10 font-mono tracking-wide")} placeholder="ABEERA10" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="promo-type">
                Type
              </label>
              <select id="promo-type" value={draft.discountType} onChange={(e) => set("discountType", e.target.value as DiscountKind)} className={cn(inputClass, "h-10")}>
                <option value="PERCENT">Percent off</option>
                <option value="FIXED">Fixed amount (Rs)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="promo-amount">
                {draft.discountType === "PERCENT" ? "Percent" : "Rupees off"}
              </label>
              <input id="promo-amount" inputMode="decimal" value={draft.amount} onChange={(e) => set("amount", e.target.value)} className={cn(inputClass, "h-10 tabular-nums")} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="promo-min">
              Minimum order (Rs)
            </label>
            <input id="promo-min" inputMode="decimal" value={draft.minSubtotal} placeholder="No minimum" onChange={(e) => set("minSubtotal", e.target.value)} className={cn(inputClass, "h-10 tabular-nums")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="promo-start">
                Starts
              </label>
              <input id="promo-start" type="datetime-local" value={draft.startsAt} onChange={(e) => set("startsAt", e.target.value)} className={cn(inputClass, "h-10")} />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="promo-end">
                Expires
              </label>
              <input id="promo-end" type="datetime-local" value={draft.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={cn(inputClass, "h-10")} />
            </div>
          </div>
          <p className="text-[11px] text-[#8a7b6e]">Leave start or expiry empty for no limit on that side.</p>
          <ToggleRow label="Active" help="Off refuses the code even inside its dates." checked={draft.active} onChange={(value) => set("active", value)} />
        </Card>

        <aside className="space-y-5">
          <Card title="Usage">
            <label className="mb-1.5 block text-[13px] font-medium text-[#2b211c]" htmlFor="promo-limit">
              Usage limit
            </label>
            <input id="promo-limit" inputMode="numeric" value={draft.usageLimit} placeholder="Unlimited" onChange={(e) => set("usageLimit", e.target.value)} className={cn(inputClass, "h-10 tabular-nums")} />
            <p className="text-[13px] text-[#2b211c]">
              Used <b className="tabular-nums">{usedCount}</b>
              {draft.usageLimit.trim() ? ` of ${draft.usageLimit.trim()}` : ""}
            </p>
            <p className="text-[11px] text-[#8a7b6e]">Counted when an order is placed. Cancelling an order does not give the use back.</p>
            {promo ? <Notice>Orders already placed keep the discount they were given. {promo.minSubtotal ? `Minimum is currently ${formatPrice(promo.minSubtotal)}.` : ""}</Notice> : null}
          </Card>
          {promo ? (
            <Card title="Remove">
              <form action={deletePromoAction.bind(null, promo.id)}>
                <button type="submit" className={btnClass}>
                  Delete this code
                </button>
              </form>
            </Card>
          ) : null}
        </aside>
      </div>

      <SaveBar
        dirtyLabels={dirty ? ["Code"] : []}
        message={message || (promo ? "All changes saved." : "Set the code, then create it.")}
        tone={tone}
        pending={pending}
        onDiscard={() => {
          setDraft(baseline);
          setTone("idle");
          setMessage("");
        }}
        onSave={() => void save()}
        saveLabel={promo ? "Save code" : "Create code"}
      />
    </div>
  );
}
