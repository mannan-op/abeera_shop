import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = {
  title: "Checkout",
  description: "Complete your Abeera order.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">
      <p className="font-serif text-4xl tracking-[0.04em]">Abeera</p>
      <h1 className="mt-8 font-serif text-5xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">A quiet close to the order.</p>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
