import React from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Checkbox = React.forwardRef(({ 
  className, 
  checked = false,
  onChange,
  animated = false,
  ...props 
}, ref) => {
  const handleClick = () => {
    if (onChange) {
      onChange(!checked)
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "relative w-6 h-6 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        checked 
          ? "bg-gradient-to-r from-primary-500 to-primary-600 border-primary-500 shadow-lg" 
          : "bg-white border-gray-300 hover:border-primary-400",
        animated && checked && "animate-scale-up",
        className
      )}
      onClick={handleClick}
      ref={ref}
      {...props}
    >
      {checked && (
        <ApperIcon 
          name="Check" 
          size={16} 
          className={cn(
            "absolute inset-0 m-auto text-white",
            animated && "animate-confetti"
          )} 
        />
      )}
    </button>
  )
})

Checkbox.displayName = "Checkbox"

export default Checkbox