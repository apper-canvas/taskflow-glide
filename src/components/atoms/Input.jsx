import React from "react"
import { cn } from "@/utils/cn"

const Input = React.forwardRef(({ 
  className, 
  type = "text", 
  label,
  error,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200",
          error && "border-error focus:ring-error focus:border-error",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input