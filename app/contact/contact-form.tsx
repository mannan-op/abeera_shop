"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Write a little more"),
});

export default function ContactForm({ email, phone, whatsapp, address }: { email: string; phone: string; whatsapp: string; address: string }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onBlur",
  });

  return (
    <div className="mx-auto grid max-w-4xl gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
      <div>
        <h1 className="font-serif text-4xl">Contact</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Orders, exchanges, alterations and press. We reply within 2 working days.
        </p>
        <dl className="mt-6 space-y-2 text-sm">
          {email ? (
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd><a className="underline underline-offset-4" href={`mailto:${email}`}>{email}</a></dd>
            </div>
          ) : null}
          {phone ? (
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd><a className="underline underline-offset-4" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a></dd>
            </div>
          ) : null}
          {whatsapp ? (
            <div>
              <dt className="text-muted-foreground">WhatsApp</dt>
              <dd><a className="underline underline-offset-4" href={`https://wa.me/${whatsapp}`}>+{whatsapp}</a></dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted-foreground">Shop</dt>
            <dd>{address || "Lahore, Pakistan"}</dd>
          </div>
        </dl>
      </div>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          toast.success("Message noted. This preview does not send mail.");
          form.reset();
        })}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" className="mt-2" {...form.register("name")} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-2" {...form.register("email")} />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" className="mt-2" {...form.register("message")} />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
