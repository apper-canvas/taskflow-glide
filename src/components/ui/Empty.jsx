import { useState } from "react"
import Button from "@/components/atoms/Button"
import TaskModal from "@/components/organisms/TaskModal"
import ApperIcon from "@/components/ApperIcon"

const Empty = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTaskAdd = () => {
    setIsModalOpen(false)
    window.location.reload() // Simple refresh to reload tasks
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name="CheckCircle2" size={40} className="text-primary-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        No tasks yet
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Start your productivity journey! Create your first task and experience the satisfaction of checking it off your list.
      </p>
      
      <div className="flex space-x-3">
        <Button 
          variant="accent" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Your First Task
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => window.location.reload()}
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTaskAdd}
      />
    </div>
  )
}

export default Empty