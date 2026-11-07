"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { quoteTotals, type ShippingRates } from "@abeera/shared";

import { placeOrder, quoteCheckout, type CheckoutQuote } from "@/lib/checkout/actions";
import { shippingMethods } from "@/lib/catalog";
import { useShop } from "@/lib/store/shop";
import { formatPrice, formatPriceAmount } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  line1: z.string().min(1, "Enter an address"),
  city: z.string().min(1, "Enter a city"),
  region: z.string().min(1, "Enter a province"),
  postalCode: z.string().min(1, "Enter a postal code"),
  country: z.string().min(1, "Enter a country"),
  shipping: z.enum(["standard", "express"]),
  payment: z.literal("COD", { message: "Choose a payment method" }),
  discount: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function CheckoutForm({
  rates,
  paymentMethods,
}: {
  rates: ShippingRates;
  /** Methods switched on in Site settings. Card needs a gateway, so only COD can appear today. */
  paymentMethods: ("COD" | "CARD")[];
}) {
  const codEnabled = paymentMethods.includes("COD");
  const { cart, cartSubtotal, clearCart } = useShop();
  const router = useRouter();
  const [errorSummary, setErrorSummary] = React.useState<string[]>([]);
  const summaryRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      line1: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Pakistan",
      shipping: "standard",
      payment: "COD",
      discount: "",
    },
    mode: "onBlur",
  });

  const shippingId = form.watch("shipping");
  const discountCode = form.watch("discount");
  const idempotencyKey = React.useRef(crypto.randomUUID());
  const [serverQuote, setServerQuote] = React.useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);
  const [quoting, setQuoting] = React.useState(true);
  const cartKey = cart.map((item) => `${item.variantId ?? item.slug}:${item.color}:${item.size}:${item.quantity}`).join("|");

  React.useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      setQuoting(true);
      void quoteCheckout({
        items: cart,
        shippingMethod: shippingId,
        promoCode: discountCode,
      }).then((result) => {
        if (cancelled) return;
        setQuoting(false);
        if (!result.ok) {
          setServerQuote(null);
          setQuoteError(result.error);
          return;
        }
        setQuoteError(null);
        setServerQuote(result.quote);
      });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [cart, cartKey, discountCode, shippingId]);

  const subtotal = serverQuote?.subtotal ?? cartSubtotal;
  const discount = serverQuote?.discount ?? 0;
  const shippingPrice = serverQuote?.shipping ?? 0;
  const total = serverQuote?.total ?? cartSubtotal;
  const priced = new Map(serverQuote?.lines.map((line) => [line.variantId, line.unitPrice]) ?? []);

  async function onSubmit(values: Values) {
    setErrorSummary([]);
    const result = await placeOrder({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      line1: values.line1,
      city: values.city,
      region: values.region,
      postalCode: values.postalCode,
      paymentMethod: values.payment,
      shippingMethod: values.shipping,
      promoCode: values.discount,
      idempotencyKey: idempotencyKey.current,
      items: cart,
    });

    if (!result.ok) {
      setErrorSummary([result.error]);
      summaryRef.current?.focus();
      toast.error(result.error);
      return;
    }

    clearCart();
    router.push(`/order-confirmation?order=${encodeURIComponent(result.orderNumber)}`);
  }

  const onInvalid = () => {
    const messages = Object.values(form.formState.errors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));
    setErrorSummary(messages);
    summaryRef.current?.focus();
  };

  if (cart.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Your bag is empty.{" "}
        <a href="/shop" className="underline">
          Continue shopping
        </a>
      </p>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="grid gap-12 lg:grid-cols-[1fr_22rem]"
      noValidate
    >
      <div className="space-y-10">
        {errorSummary.length > 0 ? (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="border border-destructive px-4 py-4"
            aria-labelledby="error-title"
          >
            <h2 id="error-title" className="font-medium">
              There is a problem
            </h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {errorSummary.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground">
          No account needed. We&apos;ll email your order slip and you can{" "}
          <Link href="/track-order" className="underline">
            track your order
          </Link>{" "}
          with your order number and email.
        </p>

        <section>
          <h2 className="font-serif text-2xl">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email <span className="text-muted-foreground">(we send your order slip here)</span></Label>
              <Input id="email" className="mt-2" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="mt-1 text-sm text-destructive" role="alert">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" className="mt-2" autoComplete="tel" {...form.register("phone")} />
              {form.formState.errors.phone ? (
                <p className="mt-1 text-sm text-destructive" role="alert">
                  {form.formState.errors.phone.message}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="First name" id="firstName" autoComplete="given-name" form={form} />
            <Field label="Last name" id="lastName" autoComplete="family-name" form={form} />
            <div className="sm:col-span-2">
              <Field label="Address" id="line1" autoComplete="address-line1" form={form} />
            </div>
            <Field label="City" id="city" autoComplete="address-level2" form={form} />
            <Field label="Province" id="region" autoComplete="address-level1" form={form} />
            <Field label="Postal code" id="postalCode" autoComplete="postal-code" form={form} />
            <Field label="Country" id="country" autoComplete="country-name" form={form} />
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Delivery</h2>
          <RadioGroup
            className="mt-4"
            value={shippingId}
            onValueChange={(value) => form.setValue("shipping", value as Values["shipping"])}
          >
            {shippingMethods.map((method) => {
              const methodQuote = quoteTotals({
                subtotal,
                shippingMethod: method.id,
                rates,
              });
              const detail =
                method.id === "standard"
                  ? `4–5 working days.${rates.freeThreshold > 0 ? ` Complimentary over Rs. ${formatPriceAmount(rates.freeThreshold)}.` : ""}`
                  : method.detail;
              const price = methodQuote.ok ? methodQuote.shipping : method.price;
              return (
                <label key={method.id} className="flex items-center justify-between border border-border px-4 py-3">
                  <span className="flex items-center gap-3">
                    <RadioGroupItem value={method.id} />
                    <span>
                      <span className="block text-sm">{method.name}</span>
                      <span className="text-xs text-muted-foreground">{detail}</span>
                    </span>
                  </span>
                  <span className="text-sm">{price === 0 ? "Complimentary" : formatPrice(price)}</span>
                </label>
              );
            })}
          </RadioGroup>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Payment</h2>
          <RadioGroup
            className="mt-4"
            value={form.watch("payment")}
            onValueChange={(value) => form.setValue("payment", value as Values["payment"])}
          >
            {codEnabled ? (
              <label className="flex items-center gap-3 border border-border px-4 py-3">
                <RadioGroupItem value="COD" />
                Cash on delivery
              </label>
            ) : null}
          </RadioGroup>
          {!codEnabled ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              Online checkout is paused right now. Please <Link href="/contact" className="underline">contact us</Link> to order.
            </p>
          ) : null}
        </section>
      </div>

      <aside className="h-fit rounded-2xl bg-card p-8">
        <h2 className="kicker">Order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {cart.map((item) => {
            const unit = item.variantId ? (priced.get(item.variantId) ?? item.price) : item.price;
            return (
              <li key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between gap-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(unit * item.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4">
          <Label htmlFor="discount">Code</Label>
          <Input id="discount" className="mt-2" {...form.register("discount")} />
          {quoteError ? (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {quoteError}
            </p>
          ) : quoting ? (
            <p className="mt-1 text-sm text-muted-foreground">Updating the total…</p>
          ) : null}
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {discount ? (
            <div className="flex justify-between text-gold">
              <dt>{serverQuote?.promoCode ?? "Code"}</dt>
              <dd>−{formatPrice(discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shippingPrice === 0 ? "Complimentary" : formatPrice(shippingPrice)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">The total is confirmed from the shop when you place the order.</p>
        <Button type="submit" className="mt-6 w-full" disabled={form.formState.isSubmitting || quoting || Boolean(quoteError) || !serverQuote || !codEnabled}>
          {form.formState.isSubmitting ? "Placing order…" : "Place order"}
        </Button>
      </aside>
    </form>
  );
}

function Field({
  label,
  id,
  form,
  autoComplete,
}: {
  label: string;
  id: keyof Values;
  form: ReturnType<typeof useForm<Values>>;
  autoComplete?: string;
}) {
  const error = form.formState.errors[id];
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="mt-2" autoComplete={autoComplete} {...form.register(id)} />
      {error?.message ? (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {String(error.message)}
        </p>
      ) : null}
    </div>
  );
}
