import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name="AlertCircle" size={32} className="text-red-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {message}. Don't worry, you can try again and we'll help you get back on track.
      </p>
      
      <div className="flex space-x-3">
        <Button 
          variant="primary" 
          onClick={onRetry}
          className="shadow-lg"
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => window.location.reload()}
        >
          <ApperIcon name="RotateCcw" size={16} className="mr-2" />
          Refresh Page
        </Button>
      </div>
    </div>
  )
}

export default Error