import Badge from "@/components/atoms/Badge"

const PriorityBadge = ({ priority }) => {
const priorities = {
    urgent: { variant: "urgent", label: "Urgent" },
    high: { variant: "high", label: "High" },
    medium: { variant: "medium", label: "Medium" },
    low: { variant: "low", label: "Low" }
  }

  const config = priorities[priority] || priorities.low

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

export default PriorityBadge