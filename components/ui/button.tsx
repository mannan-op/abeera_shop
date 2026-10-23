import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[0.7rem] font-medium tracking-[0.14em] uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-[0_10px_28px_rgba(20,17,14,0.18)] hover:[background:color-mix(in_srgb,var(--espresso)_88%,var(--champagne))]",
        primary:
          "bg-primary text-primary-foreground hover:shadow-[0_10px_28px_rgba(20,17,14,0.18)] hover:[background:color-mix(in_srgb,var(--espresso)_88%,var(--champagne))]",
        gold: "bg-champagne text-espresso hover:bg-champagne-soft",
        outline:
          "border border-foreground/20 bg-transparent text-foreground hover:border-foreground hover:bg-primary hover:text-primary-foreground",
        ghost: "text-foreground hover:text-champagne",
        light: "bg-paper text-espresso hover:bg-champagne-soft hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)]",
        overlay:
          "border border-paper/45 bg-transparent text-paper hover:border-champagne-soft hover:bg-transparent hover:text-champagne-soft",
        link: "rounded-none border-b border-champagne px-0 pb-0.5 text-[0.7rem] tracking-[0.14em] text-foreground hover:text-espresso",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-10 px-5",
        lg: "h-14 px-10",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
