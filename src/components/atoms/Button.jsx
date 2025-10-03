import React from "react"
import { cn } from "@/utils/cn"

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl focus:ring-primary-500 hover:-translate-y-0.5",
    secondary: "bg-secondary-500 hover:bg-secondary-600 text-white shadow-md hover:shadow-lg focus:ring-secondary-500 hover:-translate-y-0.5",
    accent: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-yellow-500 text-white shadow-lg hover:shadow-xl focus:ring-accent-500 hover:-translate-y-0.5",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button