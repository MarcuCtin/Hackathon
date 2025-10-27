import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#6BF178] to-[#E2F163] text-[#04101B] hover:shadow-[0_0_20px_rgba(107,241,120,0.5)] font-semibold",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400/20",
        outline:
          "border border-[#6BF178]/30 bg-[#0a1f33]/50 text-[#DFF2D4] hover:bg-[#6BF178]/10 hover:border-[#6BF178]",
        secondary:
          "bg-[#0a1f33] text-[#DFF2D4] hover:bg-[#0f2a45]",
        ghost:
          "hover:bg-[#6BF178]/10 hover:text-[#6BF178] text-[#DFF2D4]",
        link: "text-[#6BF178] underline-offset-4 hover:text-[#E2F163]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
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
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
