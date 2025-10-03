import React from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Select = React.forwardRef(({ 
  className, 
  label,
  options = [],
  error,
  placeholder = "Select option...",
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 appearance-none bg-white",
            error && "border-error focus:ring-error focus:border-error",
            className
          )}
          ref={ref}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ApperIcon 
          name="ChevronDown" 
          size={20} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  )
})

Select.displayName = "Select"

export default Select