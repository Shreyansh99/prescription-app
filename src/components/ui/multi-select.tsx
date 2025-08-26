import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "./utils"
import { Badge } from "./badge"
import { Button } from "./button"

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ options, value, onChange, placeholder = "Select options...", className, disabled = false }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggleOption = (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue]
      onChange(newValue)
    }

    const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(value.filter(v => v !== optionValue))
    }

    const handleClearAll = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange([])
    }

    const selectedLabels = value.map(v => options.find(opt => opt.value === v)?.label).filter(Boolean)

    return (
      <div ref={ref} className={cn("relative", className)}>
        <div
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all duration-200",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && "cursor-pointer"
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedLabels.map((label, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {label}
                  {!disabled && (
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-blue-600"
                      onClick={(e) => handleRemoveOption(value[index], e)}
                    />
                  )}
                </Badge>
              ))
            )}
          </div>
          <div className="flex items-center gap-2">
            {value.length > 0 && !disabled && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClearAll}
              />
            )}
            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-blue-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-2 text-sm text-gray-500">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center px-2 py-2 text-sm cursor-pointer rounded hover:bg-blue-50",
                      value.includes(option.value) && "bg-blue-100"
                    )}
                    onClick={() => handleToggleOption(option.value)}
                  >
                    <div className="flex items-center justify-center w-4 h-4 mr-2">
                      {value.includes(option.value) && (
                        <Check className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t bg-gray-50">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>{value.length} selected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-6 px-2 text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop to close dropdown */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
export type { MultiSelectOption }
