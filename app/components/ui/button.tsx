import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-3xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          {
            "bg-[var(--color-primary)] text-foreground hover:brightness-95": variant === 'default',
            "border-2 border-[var(--color-primary)] text-foreground hover:bg-gray-50": variant === 'outline',
            "bg-[var(--color-secondary)] text-foreground hover:brightness-95": variant === 'secondary',
            "hover:bg-gray-100": variant === 'ghost',
            "bg-red-500 text-white hover:bg-red-600": variant === 'destructive',
            "h-10 px-6 py-2": size === 'default',
            "h-9 rounded-2xl px-4": size === 'sm',
            "h-12 rounded-full px-8 text-base": size === 'lg',
            "h-10 w-10": size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
