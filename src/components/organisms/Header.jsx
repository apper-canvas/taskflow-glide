import { useState } from "react"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import ProgressRing from "@/components/molecules/ProgressRing"
import TaskModal from "@/components/organisms/TaskModal"
import ApperIcon from "@/components/ApperIcon"

const Header = ({ onSearch, onTaskAdd, completionRate = 0 }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTaskAdd = (taskData) => {
    onTaskAdd(taskData)
    setIsModalOpen(false)
  }

  return (
    <header className="bg-surface border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Organize your daily tasks efficiently
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <ProgressRing progress={completionRate} size={50} />
            <div className="text-sm">
              <span className="text-gray-500">Daily Progress</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-80">
            <SearchBar onSearch={onSearch} placeholder="Search your tasks..." />
          </div>
          
          <Button 
            variant="accent" 
            onClick={() => setIsModalOpen(true)}
            className="shadow-lg hover:shadow-xl"
          >
            <ApperIcon name="Plus" size={20} className="mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTaskAdd}
      />
    </header>
  )
}

export default Header