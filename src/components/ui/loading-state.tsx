import * as React from "react"
import { cn } from "./utils"
import { Skeleton } from "./skeleton"
import { Spinner } from "./spinner"

interface LoadingStateProps {
  type?: "spinner" | "skeleton" | "dots" | "pulse"
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
  rows?: number
}

const LoadingState: React.FC<LoadingStateProps> = ({
  type = "spinner",
  size = "md",
  text,
  className,
  rows = 3
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg"
  }

  if (type === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (type === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-1", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn("ml-3 text-gray-600", sizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (type === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse" />
        {text && (
          <span className={cn("ml-3 text-gray-600", sizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  // Default spinner
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Spinner size={size} />
      {text && (
        <span className={cn("ml-3 text-gray-600", sizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

export { LoadingState }
