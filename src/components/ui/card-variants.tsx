import { cn } from "@/lib/utils"

function CardMarketing({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-marketing"
      className={cn(
        "overflow-hidden rounded-xxxl bg-canvas shadow-elevation-md",
        className
      )}
      {...props}
    />
  )
}

function CardCrm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-crm"
      className={cn(
        "overflow-hidden rounded-xl bg-canvas shadow-elevation-sm ring-1 ring-hairline-soft",
        className
      )}
      {...props}
    />
  )
}

function CardCheckoutSummary({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-checkout-summary"
      className={cn(
        "overflow-hidden rounded-xl bg-surface-soft shadow-elevation-xs",
        className
      )}
      {...props}
    />
  )
}

export { CardMarketing, CardCrm, CardCheckoutSummary }
