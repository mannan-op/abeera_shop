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
import { placeOrder } from "@/lib/auth/customer-actions";
import { shippingMethods } from "@/lib/catalog";
import { useShop } from "@/lib/store/shop";
import { formatPrice } from "@/lib/utils";

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
  shipping: z.enum(["standard", "express", "atelier"]),
  payment: z.enum(["COD", "JAZZCASH", "EASYPAISA"]),
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
  const shipping = shippingMethods.find((method) => method.id === shippingId) ?? shippingMethods[0];
  const discountCode = form.watch("discount");
  const discount = discountCode?.toUpperCase() === "ABEERA10" ? Math.round(cartSubtotal * 0.1) : 0;
  const shippingPrice = cartSubtotal >= 500000 && shippingId === "standard" ? 0 : shipping.price;
  const total = cartSubtotal - discount + shippingPrice;

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
      country: values.country,
      paymentMethod: values.payment,
      items: cart,
    });

    if (!result.ok) {
      if (result.code === "UNAUTH") {
        toast.error(result.error);
        router.push(`/login?next=${encodeURIComponent("/checkout")}`);
        return;
      }
      setErrorSummary([result.error]);
      summaryRef.current?.focus();
      toast.error(result.error);
      return;
    }

    window.sessionStorage.setItem("abeera:last-order", JSON.stringify(result.order));
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

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login?next=/checkout" className="underline">
            Sign in
          </Link>{" "}
          before placing your order.
        </p>

        <section>
          <h2 className="font-serif text-2xl">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
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
                  {cartSubtotal >= 500000 && method.id === "standard"
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
              <RadioGroupItem value="COD" />
              Cash on delivery
            </label>
            <label className="flex items-center gap-3 border border-border px-4 py-3">
              <RadioGroupItem value="JAZZCASH" />
              JazzCash
            </label>
            <label className="flex items-center gap-3 border border-border px-4 py-3">
              <RadioGroupItem value="EASYPAISA" />
              EasyPaisa
            </label>
          </RadioGroup>
          <p className="mt-2 text-xs text-muted-foreground">
            Online wallets redirect after order creation when merchant keys are configured.
          </p>
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
