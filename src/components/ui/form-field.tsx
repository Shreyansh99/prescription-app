import * as React from "react"
import { cn } from "./utils"
import { Label } from "./label"

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  helpText?: string
  children: React.ReactNode
  className?: string
  id?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required, error, helpText, children, className, id, ...props }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
    const helpTextId = `${fieldId}-help`
    const errorId = `${fieldId}-error`

    // Clone children to add accessibility attributes
    const enhancedChildren = React.cloneElement(children as React.ReactElement, {
      id: fieldId,
      'aria-describedby': cn(
        helpText && !error ? helpTextId : undefined,
        error ? errorId : undefined
      ),
      'aria-invalid': error ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false'
    } as any)

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium text-gray-700",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </Label>
        {enhancedChildren}
        {helpText && !error && (
          <p id={helpTextId} className="text-xs text-muted-foreground" role="note">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-red-600 flex items-center gap-1" role="alert" aria-live="polite">
            <span className="inline-block w-3 h-3 text-red-500" aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField }
