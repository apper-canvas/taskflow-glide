import { useState, useEffect, useMemo } from "react"
import { isToday, isPast, parseISO } from "date-fns"
import { toast } from "react-toastify"
import Header from "@/components/organisms/Header"
import Sidebar from "@/components/organisms/Sidebar"
import TaskList from "@/components/organisms/TaskList"
import { taskService } from "@/services/api/taskService"
import { categoryService } from "@/services/api/categoryService"

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ])
      
      setTasks(tasksData)
      setCategories(categoriesData)
    } catch (err) {
      setError("Failed to load tasks. Please try again.")
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

const handleTaskAdd = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData)
      
      // Reload all tasks to get any generated recurring tasks
      const allTasks = await taskService.getAll()
      setTasks(allTasks)
      
      if (taskData.isRecurring) {
        toast.success(`Recurring task created! Future instances have been generated.`)
      } else {
        toast.success("Task created successfully!")
      }
    } catch (err) {
      toast.error("Failed to create task")
      console.error("Error creating task:", err)
    }
  }

  const handleTaskUpdate = async (taskId, taskData) => {
    try {
      const updatedTask = await taskService.update(taskId, taskData)
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ))
      
if (taskData.completed_c && !tasks.find(t => t.Id === taskId)?.completed_c) {
        toast.success("Task completed! Great work! 🎉")
      } else if (!taskData.completed_c && tasks.find(t => t.Id === taskId)?.completed_c) {
        toast.info("Task marked as incomplete")
      } else {
        toast.success("Task updated successfully!")
      }
    } catch (err) {
      toast.error("Failed to update task")
      console.error("Error updating task:", err)
    }
  }

  const handleTaskDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return
    
    try {
      await taskService.delete(taskId)
      setTasks(prev => prev.filter(task => task.Id !== taskId))
      toast.success("Task deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete task")
      console.error("Error deleting task:", err)
    }
  }

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Apply category filter
if (activeCategory === "today") {
      filtered = filtered.filter(task => 
        task.due_date_c && isToday(parseISO(task.due_date_c)) && !task.completed_c
      )
    } else if (activeCategory === "overdue") {
      filtered = filtered.filter(task => 
        task.due_date_c && isPast(parseISO(task.due_date_c)) && !task.completed_c
      )
} else if (activeCategory !== "all") {
      filtered = filtered.filter(task => task.category_c === activeCategory)
    }

    // Apply search filter
    if (searchTerm) {
const search = searchTerm.toLowerCase()
      filtered = filtered.filter(task =>
        task.title_c.toLowerCase().includes(search) ||
        task.description_c?.toLowerCase().includes(search)
      )
    }

    // Sort by priority and due date
return filtered.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.completed_c !== b.completed_c) {
        return a.completed_c ? 1 : -1
      }
      
      // Sort by priority (high > medium > low)
const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = (priorityOrder[b.priority_c] || 1) - (priorityOrder[a.priority_c] || 1)
      if (priorityDiff !== 0) return priorityDiff
      
// Sort by due date (closest first)
      if (a.due_date_c && b.due_date_c) {
        return new Date(a.due_date_c) - new Date(b.due_date_c)
      }
      if (a.due_date_c) return -1
      if (b.due_date_c) return 1
      
      // Finally sort by creation date (newest first)
      return new Date(b.CreatedOn) - new Date(a.CreatedOn)
    })
  }, [tasks, activeCategory, searchTerm])

  const taskCounts = useMemo(() => {
const counts = {
      all: tasks.filter(t => !t.completed_c).length,
      today: tasks.filter(t => 
        t.due_date_c && isToday(parseISO(t.due_date_c)) && !t.completed_c
      ).length,
      overdue: tasks.filter(t => 
        t.due_date_c && isPast(parseISO(t.due_date_c)) && !t.completed_c
      ).length
    }

categories.forEach(category => {
      counts[category.Id] = tasks.filter(t => 
        t.category_c === category.Id && !t.completed_c
      ).length
    })

    return counts
  }, [tasks, categories])

  const completionRate = useMemo(() => {
    const totalTasks = tasks.length
if (totalTasks === 0) return 0
    const completedTasks = tasks.filter(t => t.completed_c).length
    return (completedTasks / totalTasks) * 100
  }, [tasks])

  return (
    <div className="flex h-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          taskCounts={taskCounts}
          className="h-full"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onSearch={setSearchTerm}
          onTaskAdd={handleTaskAdd}
          completionRate={completionRate}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {activeCategory === "all" && "All Tasks"}
                {activeCategory === "today" && "Today's Tasks"}
                {activeCategory === "overdue" && "Overdue Tasks"}
{activeCategory !== "all" && activeCategory !== "today" && activeCategory !== "overdue" && 
                  categories.find(c => c.Id === activeCategory)?.name_c
                }
              </h2>
              <p className="text-sm text-gray-500">
                {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>

            <TaskList
              tasks={filteredTasks}
              loading={loading}
              error={error}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onRetry={loadData}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default TaskDashboard