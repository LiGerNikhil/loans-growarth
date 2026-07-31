import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-ink-deep text-ink-button active:bg-ink-deep/90",
        "buy-cta":
          "bg-primary text-on-primary active:bg-primary-deep",
        secondary:
          "border-hairline bg-canvas text-ink active:bg-surface-soft",
      },
      size: {
        default: "h-10 gap-2 px-5 text-button",
        sm: "h-8 gap-1.5 px-4 text-button",
        lg: "h-12 gap-2.5 px-7 text-button-large",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function ButtonPrimary({
  className,
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button-primary"
      className={cn(buttonVariants({ variant: "primary", size, className }))}
      {...props}
    />
  )
}

function ButtonBuyCta({
  className,
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button-buy-cta"
      className={cn(buttonVariants({ variant: "buy-cta", size, className }))}
      {...props}
    />
  )
}

function ButtonSecondary({
  className,
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button-secondary"
      className={cn(buttonVariants({ variant: "secondary", size, className }))}
      {...props}
    />
  )
}

export { ButtonPrimary, ButtonBuyCta, ButtonSecondary, buttonVariants }
