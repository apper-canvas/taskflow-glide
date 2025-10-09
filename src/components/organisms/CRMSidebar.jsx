import { useState } from "react"
import { useNavigate, useLocation } from 'react-router-dom'
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { cn } from "@/utils/cn"

const CRMSidebar = ({ className = "" }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      id: 'dashboard',
      label: 'CRM Dashboard',
      icon: 'LayoutDashboard',
      path: '/crm',
      count: null
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: 'Users',
      path: '/crm/contacts',
      count: null
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: 'Building2',
      path: '/crm/companies',
      count: null
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: 'HandHeart',
      path: '/crm/deals',
      count: null
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: 'UserPlus',
      path: '/crm/leads',
      count: null
    }
  ]

  const isActive = (path) => {
    if (path === '/crm') {
      return location.pathname === '/crm'
    }
    return location.pathname.startsWith(path)
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <aside className={cn("bg-surface border-r border-gray-200 h-full", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" size={20} className="text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">CRM</h2>
                <p className="text-xs text-gray-500">Customer Management</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            <ApperIcon 
              name={isCollapsed ? "ChevronRight" : "ChevronLeft"} 
              size={16} 
            />
          </Button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "sidebar-item w-full text-left",
                isActive(item.path) && "active"
              )}
            >
              <ApperIcon name={item.icon} size={20} />
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.count !== null && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ApperIcon name="TrendingUp" size={14} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Sales Pipeline</h4>
                <p className="text-xs text-gray-600">Track your progress</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation('/crm/deals')}
              className="w-full text-xs"
            >
              View Pipeline
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}

// Wrapper component to conditionally render CRM sidebar
export const CRMSidebarWrapper = () => {
  const location = useLocation()
  const isCRMRoute = location.pathname.startsWith('/crm')

  if (!isCRMRoute) {
    return <div className="text-gray-500 p-6">Sidebar content will be rendered by pages</div>
  }

  return <CRMSidebar />
}

export default CRMSidebar