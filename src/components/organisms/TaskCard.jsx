import React, { useState } from "react";
import { format, isPast, isToday, parseISO } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import PriorityBadge from "@/components/molecules/PriorityBadge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Checkbox from "@/components/atoms/Checkbox";
import { cn } from "@/utils/cn";

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

const handleToggleComplete = () => {
    if (!onToggleComplete) return;
    setIsCompleting(true);
    setTimeout(() => {
      onToggleComplete(task.id);
      setIsCompleting(false);
    }, 300);
  };

const isOverdue = task.due_date_c && isPast(parseISO(task.due_date_c)) && !task.completed_c
  const isDueToday = task.due_date_c && isToday(parseISO(task.due_date_c))

return (
    <Card className={cn(
      "task-card p-4",
      task.completed_c && "task-completed",
      isCompleting && "animate-fade-out"
    )}>
      <div className="flex items-start space-x-4">
<Checkbox
          checked={task.completed_c}
          onChange={handleToggleComplete}
          animated={true}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
"font-medium text-gray-900 truncate",
                task.completed_c && "line-through text-gray-500"
              )}>
                {task.title_c}
              </h3>
              
{(task.generated_description_c || task.description_c) && (
                <p className={cn(
                  "text-sm text-gray-600 mt-1 line-clamp-2",
                  task.completed_c && "text-gray-400"
                )}>
                  {task.generated_description_c || task.description_c}
                </p>
              )}

<div className="flex items-center space-x-3 mt-3">
                <PriorityBadge priority={task.priority_c} />
                
{task.is_recurring_c && (
                  <div className="flex items-center space-x-1 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    <ApperIcon name="RotateCw" size={12} />
                    <span className="capitalize">{task.recurring_frequency_c}</span>
                  </div>
                )}
                
{task.due_date_c && (
                  <div className={cn(
                    "flex items-center space-x-1 text-xs px-2 py-1 rounded-full",
                    isOverdue
                      ? "text-red-600 bg-red-50"
                      : isDueToday
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-500 bg-gray-100"
                  )}>
                    <ApperIcon name="Calendar" size={12} />
                    <span>
                      {format(parseISO(task.due_date_c), "MMM d")}
                      {isOverdue && " (Overdue)"}
                      {isDueToday && " (Today)"}
                    </span>
</div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(task)}
                className="p-2"
              >
                <ApperIcon name="Edit" size={16} />
              </Button>
              
<Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(task.id)}
                className="p-2 text-gray-400 hover:text-error"
              >
                <ApperIcon name="Trash2" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default TaskCard