import React, { useState, useEffect } from "react";
import { format, isPast, isToday, parseISO } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import PriorityBadge from "@/components/molecules/PriorityBadge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Checkbox from "@/components/atoms/Checkbox";
import { cn } from "@/utils/cn";
import { taskService } from "@/services/api/taskService";

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onAddSubtask, onSubtaskUpdate, onSubtaskDelete, isSubtask = false }) => {
const [isCompleting, setIsCompleting] = useState(false)
  const [subtasks, setSubtasks] = useState([])
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [loadingSubtasks, setLoadingSubtasks] = useState(false)

  const isOverdue = task.due_date_c && isPast(parseISO(task.due_date_c)) && !task.completed_c
  const isDueToday = task.due_date_c && isToday(parseISO(task.due_date_c)) && !task.completed_c

  const handleToggleComplete = async () => {
    setIsCompleting(true)
    setTimeout(() => {
      onToggleComplete()
      setIsCompleting(false)
    }, 300)
  }

  const fetchSubtasks = async () => {
    if (isSubtask || !task.Id) return
    
    setLoadingSubtasks(true)
    try {
      const subtaskData = await taskService.getSubtasks(task.Id)
      setSubtasks(subtaskData || [])
    } catch (error) {
      console.error("Error fetching subtasks:", error)
      setSubtasks([])
    } finally {
      setLoadingSubtasks(false)
    }
  }

  useEffect(() => {
    if (showSubtasks && subtasks.length === 0) {
      fetchSubtasks()
    }
  }, [showSubtasks])

  useEffect(() => {
    if (!isSubtask) {
      fetchSubtasks()
    }
  }, [task.Id])

  const toggleSubtasks = () => {
    setShowSubtasks(!showSubtasks)
  }

  const completedSubtasks = subtasks.filter(st => st.completed_c).length
  const totalSubtasks = subtasks.length

  return (
<div>
      <Card className={cn(
        "task-card p-4",
        task.completed_c && "task-completed",
        isCompleting && "animate-fade-out",
        isSubtask && "ml-8"
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
                  
                  {!isSubtask && totalSubtasks > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <ApperIcon name="ListTree" size={12} />
                      <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
                    </div>
                  )}
                  
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
                {!isSubtask && totalSubtasks > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSubtasks}
                    className="p-2"
                  >
                    <ApperIcon name={showSubtasks ? "ChevronUp" : "ChevronDown"} size={16} />
                  </Button>
                )}
                
                {!isSubtask && onAddSubtask && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddSubtask?.(task)}
                    className="p-2"
                    title="Add Subtask"
                  >
                    <ApperIcon name="Plus" size={16} />
                  </Button>
                )}
                
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
                  onClick={() => onDelete?.(task.Id)}
                  className="p-2 text-gray-400 hover:text-error"
                >
                  <ApperIcon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Subtasks */}
      {!isSubtask && showSubtasks && (
        <div className="mt-2 ml-4 space-y-2">
          {loadingSubtasks ? (
            <div className="text-sm text-gray-500 px-4 py-2">Loading subtasks...</div>
          ) : subtasks.length > 0 ? (
            subtasks.map(subtask => (
              <TaskCard
                key={subtask.Id}
                task={subtask}
                onToggleComplete={() => onSubtaskUpdate?.(subtask.Id, {
                  ...subtask,
                  completed_c: !subtask.completed_c,
                  completed_at_c: !subtask.completed_c ? new Date().toISOString() : null
                })}
                onEdit={() => onEdit?.(subtask)}
                onDelete={() => onSubtaskDelete?.(subtask.Id)}
                isSubtask={true}
              />
            ))
          ) : (
            <div className="text-sm text-gray-500 px-4 py-2">No subtasks</div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskCard