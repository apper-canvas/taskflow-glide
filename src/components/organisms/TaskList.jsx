import { useState } from "react"
import TaskCard from "@/components/organisms/TaskCard"
import TaskModal from "@/components/organisms/TaskModal"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"

const TaskList = ({ 
  tasks, 
  loading, 
  error, 
  onTaskUpdate, 
  onTaskDelete, 
  onRetry 
}) => {
  const [editingTask, setEditingTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={onRetry} />
  if (tasks.length === 0) return <Empty />

  const handleEditTask = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleTaskUpdate = (taskData) => {
    onTaskUpdate(editingTask.Id, taskData)
    setEditingTask(null)
    setIsModalOpen(false)
  }

  const handleCloseModal = () => {
    setEditingTask(null)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard
          key={task.Id}
          task={task}
onToggleComplete={() => onTaskUpdate(task.Id, { 
            ...task, 
            completed_c: !task.completed_c,
            completed_at_c: !task.completed_c ? new Date().toISOString() : null
          })}
          onEdit={() => handleEditTask(task)}
          onDelete={() => onTaskDelete(task.Id)}
        />
      ))}

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleTaskUpdate}
        initialData={editingTask}
        isEditing={true}
      />
    </div>
  )
}

export default TaskList