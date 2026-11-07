import type { SiteSettings } from "@abeera/shared";

export type MailOrder = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  shipping: number;
  shippingMethod: string;
  discount: number;
  total: number;
  address: { name: string; line1: string; line2: string | null; city: string; region: string; postalCode: string; country: string; phone: string };
  items: { productName: string; productSlug: string; productImage: string | null; color: string; size: string; price: number; quantity: number }[];
  payment: { method: string } | null;
};

type Ctx = { order: MailOrder; settings: SiteSettings; siteUrl: string };

const C = { ivory: "#f4efe7", paper: "#fbf8f3", ink: "#2b211c", muted: "#76685c", line: "#e4dccf", gold: "#b0894f", espresso: "#1a1613" };
const SERIF = "'Average', Georgia, 'Times New Roman', serif";
const SANS = "'Work Sans', 'Helvetica Neue', Arial, sans-serif";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const pkr = (paisa: number) => `Rs ${Math.round(paisa / 100).toLocaleString("en-PK")}`;
const PAY: Record<string, string> = { COD: "Cash on delivery", CARD: "Card", JAZZCASH: "JazzCash", EASYPAISA: "Easypaisa" };
const delivery = (method: string) => (method === "express" ? "1–2 working days" : "4–5 working days");
const absolute = (url: string | null, siteUrl: string) => (!url ? null : url.startsWith("http") ? url : `${siteUrl}${url}`);

function shell(title: string, preheader: string, body: string, settings: SiteSettings) {
  const s = settings.store;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.ivory};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ivory};"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${C.paper};border:1px solid ${C.line};">
<tr><td align="center" style="padding:28px 32px 20px;border-bottom:1px solid ${C.line};">
<div style="font-family:${SERIF};font-size:30px;letter-spacing:2px;color:${C.ink};">Abeera</div>
<div style="font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.gold};margin-top:4px;">Lahore</div>
</td></tr>
${body}
<tr><td style="background:${C.espresso};padding:22px 32px;font-family:${SANS};font-size:12px;line-height:1.7;color:#d9cfc2;">
Questions? Write to <a href="mailto:${esc(s.contactEmail)}" style="color:#e2cfa6;">${esc(s.contactEmail)}</a> or call / WhatsApp <a href="tel:${esc(s.contactPhone)}" style="color:#e2cfa6;">${esc(s.contactPhone)}</a>.<br>
${s.address ? esc(s.address) : "Lahore, Pakistan"}
</td></tr></table></td></tr></table></body></html>`;
}

function itemsTable(order: MailOrder, siteUrl: string) {
  const rows = order.items
    .map((i) => {
      const img = absolute(i.productImage, siteUrl);
      return `<tr>
<td width="64" style="padding:12px 0;border-bottom:1px solid ${C.line};vertical-align:top;">${img ? `<img src="${esc(img)}" width="56" height="70" alt="" style="display:block;width:56px;height:70px;object-fit:cover;background:${C.line};">` : ""}</td>
<td style="padding:12px 12px;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:13px;color:${C.ink};vertical-align:top;">
<div style="font-family:${SERIF};font-size:16px;">${esc(i.productName)}</div>
<div style="color:${C.muted};margin-top:2px;">${esc(i.color)} · Size ${esc(i.size)} · Qty ${i.quantity}</div></td>
<td align="right" style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:13px;color:${C.ink};vertical-align:top;white-space:nowrap;">${pkr(i.price * i.quantity)}${i.quantity > 1 ? `<div style="color:${C.muted};font-size:11px;">${pkr(i.price)} each</div>` : ""}</td>
</tr>`;
    })
    .join("");
  const line = (label: string, value: string, strong = false) =>
    `<tr><td colspan="2" style="padding:4px 0;font-family:${SANS};font-size:13px;color:${strong ? C.ink : C.muted};${strong ? "font-weight:600;" : ""}">${label}</td><td align="right" style="padding:4px 0;font-family:${SANS};font-size:${strong ? 15 : 13}px;color:${C.ink};${strong ? "font-weight:600;" : ""}">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
<tr><td colspan="3" style="height:10px"></td></tr>
${line("Subtotal", pkr(order.subtotal))}
${order.discount > 0 ? line("Discount", `−${pkr(order.discount)}`) : ""}
${line(`Delivery (${order.shippingMethod === "express" ? "express" : "standard"})`, order.shipping === 0 ? "Free" : pkr(order.shipping))}
${line("Total (PKR)", pkr(order.total), true)}
</table>`;
}

function addressBlock(order: MailOrder) {
  const a = order.address;
  return [a.name, a.line1, a.line2, `${a.city}, ${a.region}${a.postalCode ? ` ${a.postalCode}` : ""}`, a.country, a.phone]
    .filter(Boolean)
    .map((l) => esc(String(l)))
    .join("<br>");
}

const label = (t: string) => `<div style="font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.gold};margin-bottom:6px;">${t}</div>`;
const p = (html: string) => `<p style="margin:0 0 12px;font-family:${SANS};font-size:14px;line-height:1.65;color:${C.muted};">${html}</p>`;

export function customerOrderEmail({ order, settings, siteUrl }: Ctx) {
  const method = PAY[order.payment?.method ?? ""] ?? "—";
  const body = `
<tr><td style="padding:32px 32px 8px;">
${label("Order confirmed")}
<h1 style="margin:0 0 12px;font-family:${SERIF};font-weight:400;font-size:28px;color:${C.ink};">Thank you, ${esc(order.customerName.split(" ")[0] || order.customerName)}.</h1>
${p(`We've received your order <strong style="color:${C.ink};">${esc(order.orderNumber)}</strong>. It will be delivered in <strong style="color:${C.ink};">${delivery(order.shippingMethod)}</strong>.`)}
${order.payment?.method === "COD" ? p(`Payment: <strong style="color:${C.ink};">Cash on delivery</strong> — please keep <strong style="color:${C.ink};">${pkr(order.total)}</strong> ready for the rider.`) : p(`Payment: <strong style="color:${C.ink};">${method}</strong>.`)}
</td></tr>
<tr><td style="padding:8px 32px 8px;">${label("Your order slip")}${itemsTable(order, siteUrl)}</td></tr>
<tr><td style="padding:20px 32px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="50%" style="vertical-align:top;padding-right:12px;">${label("Delivering to")}<div style="font-family:${SANS};font-size:13px;line-height:1.6;color:${C.ink};">${addressBlock(order)}</div></td>
<td width="50%" style="vertical-align:top;">${label("Order")}<div style="font-family:${SANS};font-size:13px;line-height:1.6;color:${C.ink};">${esc(order.orderNumber)}<br>${order.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" })}<br>${method}</div></td>
</tr></table></td></tr>
<tr><td style="padding:20px 32px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${C.ink};padding:12px 22px;"><a href="${siteUrl}/track-order?order=${encodeURIComponent(order.orderNumber)}" style="font-family:${SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#fff;text-decoration:none;">Track your order</a></td></tr></table>
<div style="height:16px"></div>
${p(`Need a different size or colour? Unworn pieces with tags can be exchanged within 7 days of delivery, subject to stock. See our <a href="${siteUrl}/refund-policy" style="color:${C.gold};">Exchange, Cancellation &amp; Refund Policy</a>.`)}
</td></tr>`;
  return shell(`Order ${order.orderNumber}`, `Order ${order.orderNumber} confirmed — ${pkr(order.total)}, ${method}.`, body, settings);
}

export function adminOrderEmail({ order, settings, siteUrl }: Ctx) {
  const method = PAY[order.payment?.method ?? ""] ?? "—";
  const units = order.items.reduce((n, i) => n + i.quantity, 0);
  const body = `
<tr><td style="padding:32px 32px 8px;">
${label("New order")}
<h1 style="margin:0 0 8px;font-family:${SERIF};font-weight:400;font-size:26px;color:${C.ink};">${esc(order.orderNumber)} · ${pkr(order.total)}</h1>
${p(`${units} item${units === 1 ? "" : "s"} · ${method} · ${order.shippingMethod === "express" ? "Express" : "Standard"} delivery`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr><td style="background:${C.ink};padding:12px 22px;"><a href="${siteUrl}/admin/orders/${order.id}" style="font-family:${SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#fff;text-decoration:none;">Open in admin</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="50%" style="vertical-align:top;padding-right:12px;">${label("Customer")}<div style="font-family:${SANS};font-size:13px;line-height:1.6;color:${C.ink};">${esc(order.customerName)}<br><a href="mailto:${esc(order.customerEmail)}" style="color:${C.ink};">${esc(order.customerEmail)}</a><br><a href="tel:${esc(order.customerPhone)}" style="color:${C.ink};">${esc(order.customerPhone)}</a></div></td>
<td width="50%" style="vertical-align:top;">${label("Deliver to")}<div style="font-family:${SANS};font-size:13px;line-height:1.6;color:${C.ink};">${addressBlock(order)}</div></td>
</tr></table></td></tr>
<tr><td style="padding:16px 32px 28px;">${label("Items")}${itemsTable(order, siteUrl)}</td></tr>`;
  return shell(`New order ${order.orderNumber}`, `${order.customerName} ordered ${units} item(s), ${pkr(order.total)}.`, body, settings);
}
