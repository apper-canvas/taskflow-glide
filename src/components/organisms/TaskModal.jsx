import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Button from "@/components/atoms/Button"
import TaskFormFields from "@/components/molecules/TaskFormFields"
import ApperIcon from "@/components/ApperIcon"
import { taskService } from "@/services/api/taskService"
import { categoryService } from "@/services/api/categoryService"
import { toast } from "react-toastify"
const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditing = false 
}) => {
const [formData, setFormData] = useState({
    title_c: "",
    description_c: "",
    category_c: "",
    priority_c: "medium",
    due_date_c: "",
    is_recurring_c: false,
    recurring_frequency_c: "",
    recurring_start_date_c: "",
    recurring_end_date_c: "",
    recurring_enabled_c: true,
    generated_description_c: "",
    subcategory_c: "",
    urgency_c: ""
  })
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      if (initialData) {
setFormData({
          title_c: initialData.title_c || initialData.title || "",
          description_c: initialData.description_c || initialData.description || "",
          category_c: initialData.category_c || initialData.category || "",
          priority_c: initialData.priority_c || initialData.priority || "medium",
          due_date_c: initialData.due_date_c || initialData.dueDate || "",
          is_recurring_c: initialData.is_recurring_c !== undefined ? initialData.is_recurring_c : (initialData.isRecurring || false),
          recurring_frequency_c: initialData.recurring_frequency_c || initialData.recurringFrequency || "",
          recurring_start_date_c: initialData.recurring_start_date_c || initialData.recurringStartDate || "",
          recurring_end_date_c: initialData.recurring_end_date_c || initialData.recurringEndDate || "",
          recurring_enabled_c: initialData.recurring_enabled_c !== undefined ? initialData.recurring_enabled_c : (initialData.recurringEnabled !== false),
          generated_description_c: initialData.generated_description_c || initialData.generatedDescription || "",
          subcategory_c: initialData.subcategory_c || initialData.subcategory || "",
          urgency_c: initialData.urgency_c || initialData.urgency || ""
        })
      } else {
setFormData({
          title: "",
          description: "",
          generatedDescription: "",
          category: "",
          priority: "medium",
          dueDate: "",
          isRecurring: false,
          recurringFrequency: "",
          recurringStartDate: "",
          recurringEndDate: "",
          recurringEnabled: true
        })
      }
      setErrors({})
    }
  }, [isOpen, initialData])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title_c.trim()) {
      newErrors.title_c = "Task title is required"
    }
    
    if (!formData.category_c) {
      newErrors.category_c = "Please select a category"
    }
    
    if (!formData.priority_c) {
      newErrors.priority_c = "Please select a priority"
    }
    
    // Recurring task validation
    if (formData.is_recurring_c) {
      if (!formData.recurring_frequency_c) {
        newErrors.recurring_frequency_c = "Please select a frequency"
      }
      
      if (!formData.recurring_start_date_c) {
        newErrors.recurring_start_date_c = "Start date is required for recurring tasks"
      }
      
      if (formData.recurring_end_date_c && formData.recurring_start_date_c) {
        const startDate = new Date(formData.recurring_start_date_c)
        const endDate = new Date(formData.recurring_end_date_c)
        if (endDate <= startDate) {
          newErrors.recurring_end_date_c = "End date must be after start date"
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
const taskData = {
        ...formData,
        completed_c: initialData?.completed_c !== undefined ? initialData.completed_c : (initialData?.completed || false),
        completed_at_c: initialData?.completed_at_c || initialData?.completedAt || null
      }
      
      onSubmit(taskData)
    } catch (error) {
      console.error("Error submitting task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
// Handle description generation
  const handleGenerateDescription = async (title) => {
    if (!title?.trim()) {
      toast.error('Please enter a task title first')
      return
    }

    setIsGeneratingDescription(true)
    try {
const generatedDescription = await taskService.generateDescription(title)
      setFormData(prev => ({
        ...prev,
        generated_description_c: generatedDescription
      }))
      toast.success('Description generated successfully!')
    } catch (error) {
      console.error('Failed to generate description:', error)
      // Error toast is already shown in the service method
    } finally {
      setIsGeneratingDescription(false)
    }
  }
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Edit Task" : "Create New Task"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
<TaskFormFields
              formData={formData}
              onFormChange={setFormData}
              categories={categories}
              errors={errors}
              onGenerateDescription={handleGenerateDescription}
              isGeneratingDescription={isGeneratingDescription}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Task" : "Create Task"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TaskModal