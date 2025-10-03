import { useState, useContext } from "react"
import { useSelector } from 'react-redux'
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { AuthContext } from "../../App"

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { logout } = useContext(AuthContext)

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface shadow-lg border border-gray-200"
      >
        <ApperIcon name="Menu" size={20} />
      </button>

      {/* User Info and Logout Button */}
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-3">
          <div className="hidden sm:block text-sm text-gray-600">
            Welcome, {user?.firstName || user?.name || 'User'}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="LogOut" size={16} />
            <span>Logout</span>
          </Button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-80 bg-surface shadow-xl transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            <div className="p-4">
              {/* Mobile menu content */}
              <div className="space-y-4">
                {isAuthenticated && (
                  <div className="text-sm text-gray-600 mb-4">
                    Welcome, {user?.firstName || user?.name || 'User'}
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <ApperIcon name="LogOut" size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Space */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        {/* Sidebar content will be rendered by pages */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}

export default Layout