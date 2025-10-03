import ApperIcon from "@/components/ApperIcon"

const Loading = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="bg-surface rounded-lg p-4 border border-gray-100 animate-pulse"
        >
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <ApperIcon name="Loader2" size={24} className="animate-spin text-primary-500" />
          <span className="text-gray-500 font-medium">Loading your tasks...</span>
        </div>
      </div>
    </div>
  )
}

export default Loading