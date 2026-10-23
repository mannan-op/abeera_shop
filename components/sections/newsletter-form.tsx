"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NewsletterForm({
  compact = false,
  inverted = false,
  id = "newsletter-email",
}: {
  compact?: boolean;
  inverted?: boolean;
  id?: string;
}) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle");
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 600));
    setStatus("success");
    setEmail("");
  }

  if (status === "success") {
    return (
      <p className={cn("text-sm", inverted ? "text-ivory/70" : "text-muted-foreground")} role="status">
        Thank you. We write rarely, and only when there is something to say.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "flex gap-2" : "flex flex-col gap-3 sm:flex-row"}>
      <label className="sr-only" htmlFor={id}>
        Email address
      </label>
      <Input
        id={id}
        type="email"
        required
        autoComplete="email"
        placeholder="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={cn(
          "flex-1",
          inverted && "border-white/20 bg-white/8 text-ivory placeholder:text-ivory/45 focus-visible:border-gold",
        )}
      />
      <Button type="submit" variant={inverted ? "gold" : "primary"} disabled={status === "loading"}>
        {status === "loading" ? "Sending" : "Subscribe"}
      </Button>
      {!compact ? (
        <Button type="button" variant="outline" onClick={() => router.push("/shop")}>
          Shop
        </Button>
      ) : null}
    </form>
  );
}
