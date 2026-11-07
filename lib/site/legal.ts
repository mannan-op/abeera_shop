/**
 * Legal facts for the policy pages (Safepay needs these before live card payments).
 * Anything left null shows on the site as a highlighted [PLACEHOLDER] — fill these in, don't guess.
 * Contact email, phone, WhatsApp, address and delivery fees come from Admin → Site settings → Store info.
 */
export const LEGAL = {
  /** Full legal name of the person (or company) that owns Abeera. */
  ownerLegalName: "Afshan Zia" as string | null,
  /** Registered business name, e.g. as on the NTN certificate or SECP registration. */
  registeredBusinessName: "Abeera's Collection" as string | null,
  /** Sole proprietorship, partnership, or private limited company. */
  businessType: "Sole proprietorship" as string | null,
  /** Tax registration as published. The NTN itself is NOT published (it equals the owner's CNIC). */
  taxRegistration: "Registered with the Federal Board of Revenue (FBR) for income tax, RTO Lahore, since 10 February 2023" as string | null,
  /** SECP company registration number, only if it is a company. Leave null to hide the line. */
  secpNumber: null as string | null,
  /** Address registered with FBR. Shown only on /ownership as "Registered address (FBR)"; the shop address lives in Site settings. */
  registeredAddress: "Shop # G-6, Ground Floor, PACE, Model Town Link Road, Lahore" as string | null,
  /** City whose courts handle disputes, e.g. "Lahore". */
  jurisdictionCity: "Lahore" as string | null,
  /** Date these policies take effect, e.g. "1 November 2026". */
  effectiveDate: "30 October 2026" as string | null,

  /** Working days to acknowledge a complaint, e.g. "1". */
  complaintAcknowledgeDays: "2" as string | null,
  /** Working days to resolve a complaint or offer a solution, e.g. "7". */
  complaintResolveDays: "7" as string | null,
  /** How long after placing an order a customer can cancel, e.g. "until it is dispatched" or "within 12 hours". */
  cancellationWindow: "until it is dispatched" as string | null,
  /** Working days for a card refund to reach the customer's account after we issue it (bank-dependent), e.g. "7–10". */
  cardRefundBankDays: "7–10" as string | null,
  /** When an exchange costs less, e.g. "the difference is given as store credit". */
  lowerPriceExchange: "If the replacement costs less, our team will contact you to settle the difference case by case." as string | null,
  /** Who pays delivery both ways on a size/colour exchange, e.g. "the customer" or "Abeera". */
  returnShippingPaidBy: "the customer, except for faulty, damaged or wrong items, where Abeera pays" as string | null,

  /* Taken from the existing Returns and Shipping pages — confirm they are still right. */
  /** Exchange window in days from delivery (from the old Returns page — confirm). */
  returnWindowDays: "7",
  refundIssueWorkingDays: "5",
  standardDeliveryDays: "4–5",
  expressDeliveryDays: "1–2",
  dispatchCity: "Lahore",
};
