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

export default function ContactForm() {
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
          Care, alterations, and press. We reply within a working day.
        </p>
        <p className="mt-6 text-sm">care@abeera.example</p>
        <p className="text-sm text-muted-foreground">Lahore, Pakistan</p>
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
