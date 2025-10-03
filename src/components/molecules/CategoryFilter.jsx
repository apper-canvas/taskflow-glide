import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const CategoryFilter = ({ categories, activeCategory, onCategoryChange, taskCounts }) => {
  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
      </div>
      
      <button
        onClick={() => onCategoryChange("all")}
        className={cn(
          "sidebar-item w-full",
          activeCategory === "all" && "active"
        )}
      >
        <ApperIcon name="List" size={20} />
        <span className="flex-1 text-left">All Tasks</span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {taskCounts.all || 0}
        </span>
      </button>

      <button
        onClick={() => onCategoryChange("today")}
        className={cn(
          "sidebar-item w-full",
          activeCategory === "today" && "active"
        )}
      >
        <ApperIcon name="Calendar" size={20} />
        <span className="flex-1 text-left">Today</span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {taskCounts.today || 0}
        </span>
      </button>

      <button
        onClick={() => onCategoryChange("overdue")}
        className={cn(
          "sidebar-item w-full",
          activeCategory === "overdue" && "active"
        )}
      >
        <ApperIcon name="AlertCircle" size={20} />
        <span className="flex-1 text-left">Overdue</span>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
          {taskCounts.overdue || 0}
        </span>
      </button>

      <div className="pt-4 border-t border-gray-200 mt-4">
        {categories.map(category => (
          <button
            key={category.Id}
            onClick={() => onCategoryChange(category.Id)}
            className={cn(
              "sidebar-item w-full",
              activeCategory === category.Id && "active"
            )}
          >
            <ApperIcon name={category.icon} size={20} />
            <span className="flex-1 text-left">{category.name}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {taskCounts[category.Id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter