import React from "react"
import { cn } from "@/utils/cn"

const Card = React.forwardRef(({ 
  className, 
  children, 
  variant = "default",
  ...props 
}, ref) => {
  const baseStyles = "bg-surface rounded-lg transition-all duration-200"
  
  const variants = {
    default: "shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1",
    elevated: "shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1",
    flat: "border border-gray-200"
  }
  
  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = "Card"

export default Card