import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "accent" | "destructive" }) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      {
        "border-transparent bg-[var(--color-primary)] text-foreground": variant === "default",
        "border-transparent bg-[var(--color-secondary)] text-foreground": variant === "secondary",
        "border-transparent bg-[var(--color-accent)] text-foreground": variant === "accent",
        "border-transparent bg-red-100 text-red-800": variant === "destructive",
      }, className
    )} {...props} />
  )
}
export { Badge }
