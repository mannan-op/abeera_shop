"use client";

import * as React from "react";

import { defaultHomepageContent } from "@abeera/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const newsletterDefaults = defaultHomepageContent.newsletter;

export function NewsletterForm({
  compact = false,
  inverted = false,
  id = "newsletter-email",
  emailLabel = newsletterDefaults.emailLabel,
  placeholder = newsletterDefaults.placeholder,
  submitLabel = newsletterDefaults.submitLabel,
  sendingLabel = newsletterDefaults.sendingLabel,
  successMessage = newsletterDefaults.successMessage,
}: {
  compact?: boolean;
  inverted?: boolean;
  id?: string;
  emailLabel?: string;
  placeholder?: string;
  submitLabel?: string;
  sendingLabel?: string;
  successMessage?: string;
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
        {successMessage}
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "flex gap-2" : "mx-auto flex max-w-[460px] flex-wrap justify-center gap-2"}
    >
      <label className="sr-only" htmlFor={id}>
        {emailLabel}
      </label>
      <Input
        id={id}
        type="email"
        required
        autoComplete="email"
        placeholder={placeholder}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={cn(
          "flex-1",
          inverted &&
            "border-paper/30 bg-transparent text-paper placeholder:text-paper/45 focus-visible:border-champagne-soft",
        )}
      />
      <Button type="submit" variant={inverted ? "gold" : "primary"} disabled={status === "loading"}>
        {status === "loading" ? sendingLabel : submitLabel}
      </Button>
    </form>
  );
}
