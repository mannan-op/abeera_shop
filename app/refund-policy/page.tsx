import type { Metadata } from "next";
import Link from "next/link";

import { ContactList, fact, PolicyPage } from "@/components/site/policy";
import { LEGAL } from "@/lib/site/legal";
import { getSiteSettings } from "@/lib/site/settings";

export const metadata: Metadata = {
  title: "Exchange, Cancellation & Refund Policy",
  description: "How to exchange a piece, cancel an order, and the rare cases where Abeera gives a refund.",
};

export default async function RefundPolicyPage() {
  const settings = await getSiteSettings();
  return (
    <PolicyPage
      title="Exchange, Cancellation & Refund Policy"
      path="/refund-policy"
      intro={
        <p>
          Abeera offers <strong className="font-medium text-foreground">exchanges, not refunds</strong>. If a piece doesn&apos;t suit you, you can exchange it for another size, colour or design. We do not give cash or card refunds for change of mind; refunds are made only in the exceptional cases listed below.
        </p>
      }
      sections={[
        {
          id: "exchanges",
          title: "Exchanges",
          body: (
            <>
              <p>You can exchange a piece within <strong>{LEGAL.returnWindowDays} days of delivery</strong> if it is:</p>
              <ul>
                <li>unworn, unwashed and unaltered, and</li>
                <li>returned with all original tags and packaging.</li>
              </ul>
              <p>Exchanges are subject to stock. If the new piece costs more you pay the difference. {fact(LEGAL.lowerPriceExchange, "WHAT HAPPENS TO THE PRICE DIFFERENCE")} If what you want is out of stock, we will help you choose another piece.</p>
              <p>These cannot be exchanged unless they arrive faulty, damaged or wrong: sale items, made-to-order, custom-stitched or altered pieces, and pierced jewellery (for hygiene reasons).</p>
              <p>To start an exchange, contact us with your order number. Delivery both ways for a size or colour exchange is paid by {fact(LEGAL.returnShippingPaidBy, "WHO PAYS EXCHANGE DELIVERY")}.</p>
            </>
          ),
        },
        {
          id: "cancel",
          title: "Cancelling an order",
          body: (
            <>
              <p>You can cancel an order {fact(LEGAL.cancellationWindow, "CANCELLATION WINDOW, e.g. until it is dispatched")} by contacting us with your order number. Orders are delivered within {LEGAL.standardDeliveryDays} working days.</p>
              <ul>
                <li><strong>Cash on delivery:</strong> nothing has been charged, so cancellation is immediate.</li>
                <li><strong>Card:</strong> an order cancelled before dispatch is refunded in full (see refund timelines below).</li>
              </ul>
              <p>Once an order has been dispatched it can no longer be cancelled, but eligible pieces can be exchanged under this policy. Made-to-order and altered pieces cannot be cancelled once work has started.</p>
              <p>If we have to cancel an order — for example an item is out of stock or the address can&apos;t be served — any payment is refunded in full.</p>
            </>
          ),
        },
        {
          id: "faulty",
          title: "Faulty, damaged or wrong items",
          body: <p>If a piece arrives faulty, damaged or is not what you ordered, tell us within 48 hours of delivery with your order number and photos. We collect it at our cost and send a replacement or an exchange. If we cannot replace or exchange it, we refund it in full, including delivery charges.</p>,
        },
        {
          id: "refunds",
          title: "When we refund",
          body: (
            <>
              <p>Refunds are a rare exception. We refund only when:</p>
              <ul>
                <li>an item is faulty, damaged or wrong and cannot be exchanged or replaced;</li>
                <li>an order is cancelled before dispatch, by you or by us;</li>
                <li>your card was charged twice or by mistake for the same order.</li>
              </ul>
              <p>There are no refunds for change of mind, fit or colour preference — please use an exchange instead.</p>
            </>
          ),
        },
        {
          id: "timelines",
          title: "Refund timelines",
          body: (
            <>
              <p>When a refund applies, we issue it within <strong>{LEGAL.refundIssueWorkingDays} working days</strong> of approving it (for faulty items, once the piece reaches our {LEGAL.dispatchCity} studio and is inspected).</p>
              <ul>
                <li><strong>Card payments</strong> are refunded to the same card through Safepay. Your bank usually takes a further {fact(LEGAL.cardRefundBankDays, "CARD REFUND BANK WORKING DAYS")} working days to show it on your statement.</li>
                <li><strong>Cash on delivery</strong> orders are refunded by bank transfer or mobile wallet to an account in your name that you share with us.</li>
              </ul>
            </>
          ),
        },
        {
          id: "shipping",
          title: "Shipping",
          body: (
            <p>
              We deliver within Pakistan only — we do not ship internationally. Standard delivery takes {LEGAL.standardDeliveryDays} working days and express {LEGAL.expressDeliveryDays} working days. Fees and free-delivery details are on our <Link href="/shipping" className="underline underline-offset-4">Shipping page</Link>.
            </p>
          ),
        },
        {
          id: "complaints",
          title: "Complaints",
          body: (
            <>
              <p>
                If you are unhappy with an order, an exchange or our service, contact us with your order number. We acknowledge complaints within {fact(LEGAL.complaintAcknowledgeDays, "COMPLAINT ACKNOWLEDGEMENT WORKING DAYS")} working day(s) and resolve them, or offer a solution, within {fact(LEGAL.complaintResolveDays, "COMPLAINT RESOLUTION WORKING DAYS")} working days.
              </p>
              <ContactList settings={settings} />
            </>
          ),
        },
      ]}
    />
  );
}
