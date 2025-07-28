import * as React from "react"
import { cn } from "./utils"
import { Alert, AlertDescription, AlertTitle } from "./alert"

interface NotificationProps {
  type?: "success" | "error" | "warning" | "info"
  title?: string
  message: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
  className?: string
}

const Notification: React.FC<NotificationProps> = ({
  type = "info",
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
  className
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const icons = {
    success: "✅",
    error: "❌", 
    warning: "⚠️",
    info: "ℹ️"
  }

  const variants = {
    success: "success",
    error: "destructive",
    warning: "warning", 
    info: "info"
  } as const

  return (
    <Alert 
      variant={variants[type]} 
      className={cn(
        "relative animate-fade-in shadow-lg border-l-4",
        type === "success" && "border-l-green-500",
        type === "error" && "border-l-red-500", 
        type === "warning" && "border-l-yellow-500",
        type === "info" && "border-l-blue-500",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg" aria-hidden="true">
          {icons[type]}
        </span>
        <div className="flex-1">
          {title && (
            <AlertTitle className="mb-1">
              {title}
            </AlertTitle>
          )}
          <AlertDescription>
            {message}
          </AlertDescription>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
            aria-label="Close notification"
          >
            <span className="sr-only">Close</span>
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </Alert>
  )
}

interface NotificationContainerProps {
  notifications: Array<{
    id: string
    type?: "success" | "error" | "warning" | "info"
    title?: string
    message: string
  }>
  onRemove: (id: string) => void
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center"
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemove,
  position = "top-right"
}) => {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4", 
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2"
  }

  return (
    <div 
      className={cn(
        "fixed z-50 space-y-3 max-w-sm w-full",
        positionClasses[position]
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  )
}

export { Notification, NotificationContainer }
