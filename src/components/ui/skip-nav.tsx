import * as React from "react"
import { cn } from "./utils"

interface SkipNavProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href?: string
}

const SkipNav = React.forwardRef<HTMLAnchorElement, SkipNavProps>(
  ({ className, href = "#main-content", children = "Skip to main content", ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
          "bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </a>
    )
  }
)
SkipNav.displayName = "SkipNav"

export { SkipNav }
