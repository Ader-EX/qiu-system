import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
const badgeVariants = cva(
  `
    inline-flex 
    items-center 
    max-w-full        /* allow it to shrink */
    whitespace-nowrap  /* no wrapping */
    overflow-hidden    /* hide overflow */
    truncate           /* text-overflow: ellipsis */
    rounded-full 
    border 
    px-2.5 
    py-0.5 
    text-xs 
    font-semibold 
    transition-colors 
    focus:outline-none 
    focus:ring-2 
    focus:ring-ring 
    focus:ring-offset-2
  `,
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        okay: "border-transparent bg-okay text-primary-foreground hover:bg-green-500/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
