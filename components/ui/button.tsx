import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[12px] font-medium tracking-[0.12em] uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-secondary hover:shadow-[0_12px_30px_-12px_rgba(26,22,19,0.55)]",
        primary:
          "bg-primary text-primary-foreground hover:bg-secondary hover:shadow-[0_12px_30px_-12px_rgba(26,22,19,0.55)]",
        gold: "bg-gold text-gold-foreground hover:bg-gold/90 hover:shadow-[0_12px_30px_-12px_rgba(176,137,79,0.65)]",
        outline:
          "border border-primary/20 bg-transparent text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground",
        ghost: "text-foreground hover:text-gold",
        light:
          "bg-ivory text-primary hover:bg-white",
        link: "text-foreground underline-offset-4 tracking-[0.04em] normal-case text-sm hover:underline",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-10 px-5",
        lg: "h-14 px-10",
        icon: "size-11",
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
