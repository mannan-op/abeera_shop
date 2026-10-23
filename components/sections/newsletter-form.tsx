"use client";

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
      <p className={cn("text-sm", inverted ? "text-paper/75" : "text-muted-foreground")} role="status">
        Thank you. We write rarely, and only when there is something to say.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "flex gap-2" : "mx-auto flex max-w-[460px] flex-wrap justify-center gap-2"}
    >
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
          inverted &&
            "border-paper/30 bg-transparent text-paper placeholder:text-paper/45 focus-visible:border-champagne-soft",
        )}
      />
      <Button type="submit" variant={inverted ? "gold" : "primary"} disabled={status === "loading"}>
        {status === "loading" ? "Sending" : "Subscribe"}
      </Button>
    </form>
  );
}
