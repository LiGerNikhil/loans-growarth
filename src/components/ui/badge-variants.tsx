import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-caption font-medium whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        success: "bg-success text-canvas",
        attention: "bg-attention text-ink-deep",
        critical: "bg-critical text-canvas",
        "promo-yellow": "bg-attention text-ink-deep",
        neutral: "bg-surface-soft text-slate border-hairline-soft",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function BadgeSuccess({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant: "success" }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant: "success" },
  })
}

function BadgeAttention({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant: "attention" }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant: "attention" },
  })
}

function BadgeCritical({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant: "critical" }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant: "critical" },
  })
}

function BadgePromoYellow({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant: "promo-yellow" }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant: "promo-yellow" },
  })
}

function BadgeNeutral({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant: "neutral" }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant: "neutral" },
  })
}

export { BadgeSuccess, BadgeAttention, BadgeCritical, BadgePromoYellow, BadgeNeutral, badgeVariants }
