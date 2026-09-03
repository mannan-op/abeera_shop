import { cn } from "@/lib/utils";

function Badge({
  className,
  tone = "ink",
  ...props
}: React.ComponentProps<"span"> & { tone?: "ink" | "gold" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em]",
        tone === "ink" && "bg-primary text-primary-foreground",
        tone === "gold" && "bg-gold text-gold-foreground",
        tone === "muted" && "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
