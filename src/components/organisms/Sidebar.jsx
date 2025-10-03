import CategoryFilter from "@/components/molecules/CategoryFilter"

const Sidebar = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  taskCounts,
  className = "" 
}) => {
  return (
    <aside className={`bg-surface border-r border-gray-200 p-6 ${className}`}>
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        taskCounts={taskCounts}
      />
    </aside>
  )
}

export default Sidebar