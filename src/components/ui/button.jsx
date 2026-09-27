import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "sh:inline-flex sh:shrink-0 sh:items-center sh:justify-center sh:gap-2 sh:rounded-md sh:text-sm sh:font-medium sh:whitespace-nowrap sh:transition-all sh:outline-none sh:focus-visible:border-ring sh:focus-visible:ring-[3px] sh:focus-visible:ring-ring/50 sh:disabled:pointer-events-none sh:disabled:opacity-50 sh:aria-invalid:border-destructive sh:aria-invalid:ring-destructive/20 sh:dark:aria-invalid:ring-destructive/40 sh:[&_svg]:pointer-events-none sh:[&_svg]:shrink-0 sh:[&_svg:not([class*=size-])]:size-4",
  {
    variants: {
      variant: {
        default: "sh:bg-primary sh:text-primary-foreground sh:hover:bg-primary/90",
        destructive:
          "sh:bg-destructive sh:text-white sh:hover:bg-destructive/90 sh:focus-visible:ring-destructive/20 sh:dark:bg-destructive/60 sh:dark:focus-visible:ring-destructive/40",
        outline:
          "sh:border sh:bg-background sh:shadow-xs sh:hover:bg-accent sh:hover:text-accent-foreground sh:dark:border-input sh:dark:bg-input/30 sh:dark:hover:bg-input/50",
        secondary:
          "sh:bg-secondary sh:text-secondary-foreground sh:hover:bg-secondary/80",
        ghost:
          "sh:hover:bg-accent sh:hover:text-accent-foreground sh:dark:hover:bg-accent/50",
        link: "sh:text-primary sh:underline-offset-4 sh:hover:underline",
      },
      size: {
        default: "sh:h-9 sh:px-4 sh:py-2 sh:has-[>svg]:px-3",
        xs: "sh:h-6 sh:gap-1 sh:rounded-md sh:px-2 sh:text-xs sh:has-[>svg]:px-1.5 sh:[&_svg:not([class*=size-])]:size-3",
        sm: "sh:h-8 sh:gap-1.5 sh:rounded-md sh:px-3 sh:has-[>svg]:px-2.5",
        lg: "sh:h-10 sh:rounded-md sh:px-6 sh:has-[>svg]:px-4",
        icon: "sh:size-9",
        "icon-xs": "sh:size-6 sh:rounded-md sh:[&_svg:not([class*=size-])]:size-3",
        "icon-sm": "sh:size-8",
        "icon-lg": "sh:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
