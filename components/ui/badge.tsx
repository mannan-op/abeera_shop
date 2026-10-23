import { cn } from "@/lib/utils";

function Badge({
  className,
  tone = "ink",
  ...props
}: React.ComponentProps<"span"> & { tone?: "ink" | "gold" | "muted" | "soft" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em]",
        tone === "ink" && "border-transparent bg-espresso text-paper",
        tone === "gold" && "border-gold-line/50 bg-paper text-champagne",
        tone === "soft" && "border-gold-line/50 bg-paper text-espresso",
        tone === "muted" && "border-transparent bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
