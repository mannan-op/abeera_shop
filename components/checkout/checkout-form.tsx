"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { shippingMethods } from "@/lib/catalog";
import { useShop } from "@/lib/store/shop";
import { formatPrice } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
  line1: z.string().min(1, "Enter an address"),
  city: z.string().min(1, "Enter a city"),
  region: z.string().min(1, "Enter a region"),
  postalCode: z.string().min(1, "Enter a postal code"),
  country: z.string().min(1, "Enter a country"),
  shipping: z.enum(["standard", "express", "atelier"]),
  payment: z.enum(["card", "paypal"]),
  card: z.string().optional(),
  discount: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function CheckoutForm() {
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
      line1: "",
      city: "",
      region: "",
      postalCode: "",
      country: "France",
      shipping: "standard",
      payment: "card",
      discount: "",
    },
    mode: "onBlur",
  });

  const shippingId = form.watch("shipping");
  const shipping = shippingMethods.find((method) => method.id === shippingId) ?? shippingMethods[0];
  const discountCode = form.watch("discount");
  const discount = discountCode?.toUpperCase() === "ABEERA10" ? Math.round(cartSubtotal * 0.1) : 0;
  const shippingPrice = cartSubtotal >= 40000 && shippingId === "standard" ? 0 : shipping.price;
  const tax = Math.round((cartSubtotal - discount) * 0.08);
  const total = cartSubtotal - discount + shippingPrice + tax;

  async function onSubmit(values: Values) {
    setErrorSummary([]);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const order = {
      number: `AB-${Math.floor(1800 + Math.random() * 800)}`,
      email: values.email,
      items: cart,
      total,
      shipping: shipping.name,
      address: `${values.line1}, ${values.city}`,
      estimatedDelivery:
        shippingId === "express" ? "2–3 business days" : "4–7 business days",
    };
    window.sessionStorage.setItem("abeera:last-order", JSON.stringify(order));
    clearCart();
    router.push("/order-confirmation");
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

        <section>
          <h2 className="font-serif text-2xl">Contact</h2>
          <div className="mt-4">
            <Label htmlFor="email">Email</Label>
            <Input id="email" className="mt-2" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {form.formState.errors.email.message}
              </p>
            ) : null}
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
            <Field label="Region" id="region" autoComplete="address-level1" form={form} />
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
            {shippingMethods.map((method) => (
              <label key={method.id} className="flex items-center justify-between border border-border px-4 py-3">
                <span className="flex items-center gap-3">
                  <RadioGroupItem value={method.id} />
                  <span>
                    <span className="block text-sm">{method.name}</span>
                    <span className="text-xs text-muted-foreground">{method.detail}</span>
                  </span>
                </span>
                <span className="text-sm">
                  {cartSubtotal >= 40000 && method.id === "standard"
                    ? "Complimentary"
                    : method.price === 0
                      ? "Complimentary"
                      : formatPrice(method.price)}
                </span>
              </label>
            ))}
          </RadioGroup>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Payment</h2>
          <RadioGroup
            className="mt-4"
            value={form.watch("payment")}
            onValueChange={(value) => form.setValue("payment", value as Values["payment"])}
          >
            <label className="flex items-center gap-3 border border-border px-4 py-3">
              <RadioGroupItem value="card" />
              Card
            </label>
            <label className="flex items-center gap-3 border border-border px-4 py-3">
              <RadioGroupItem value="paypal" />
              PayPal
            </label>
          </RadioGroup>
          {form.watch("payment") === "card" ? (
            <div className="mt-4">
              <Label htmlFor="card">Card number</Label>
              <Input id="card" className="mt-2" inputMode="numeric" placeholder="•••• •••• •••• ••••" />
              <p className="mt-2 text-xs text-muted-foreground">
                Demo checkout — no payment is processed.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <aside className="h-fit rounded-2xl bg-card p-8">
        <h2 className="kicker">Order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {cart.map((item) => (
            <li key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between gap-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Label htmlFor="discount">Code</Label>
          <Input id="discount" className="mt-2" {...form.register("discount")} />
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(cartSubtotal)}</dd>
          </div>
          {discount ? (
            <div className="flex justify-between text-gold">
              <dt>ABEERA10</dt>
              <dd>−{formatPrice(discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shippingPrice === 0 ? "Complimentary" : formatPrice(shippingPrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd>{formatPrice(tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <Button type="submit" className="mt-6 w-full" disabled={form.formState.isSubmitting}>
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
