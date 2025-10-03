import React from "react"
import { cn } from "@/utils/cn"

const Badge = React.forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
urgent: "bg-gradient-to-r from-red-600 to-red-500 text-white",
    high: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
    medium: "bg-gradient-to-r from-warning to-yellow-500 text-white",
    low: "bg-gradient-to-r from-success to-green-500 text-white",
    category: "bg-primary-50 text-primary-700 border border-primary-200"
  }
  
  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = "Badge"

export default Badge