import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import { contactService } from "@/services/api/contactService"
import { companyService } from "@/services/api/companyService"
import { dealService } from "@/services/api/dealService"
import { leadService } from "@/services/api/leadService"

const CRMDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    contacts: { total: 0, active: 0 },
    companies: { total: 0, active: 0 },
    deals: { total: 0, totalValue: 0, avgValue: 0 },
    leads: { total: 0, qualified: 0, avgScore: 0 }
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError("")

    try {
      const [contacts, companies, deals, leads] = await Promise.all([
        contactService.getAll(),
        companyService.getAll(),
        dealService.getAll(),
        leadService.getAll()
      ])

      // Calculate stats
      const contactStats = {
        total: contacts.length,
        active: contacts.filter(c => c.status === "active").length
      }

      const companyStats = {
        total: companies.length,
        active: companies.filter(c => c.status === "active").length
      }

      const dealStats = {
        total: deals.length,
        totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
        avgValue: deals.length > 0 ? Math.round(deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length) : 0
      }

      const leadStats = {
        total: leads.length,
        qualified: leads.filter(l => l.status === "qualified").length,
        avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length) : 0
      }

      setStats({
        contacts: contactStats,
        companies: companyStats,
        deals: dealStats,
        leads: leadStats
      })

      // Mock recent activity - in real app this would come from activity logs
      const mockActivity = [
        {
          id: 1,
          type: "deal",
          description: "New deal created: TechCorp Enterprise Platform",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          icon: "HandHeart"
        },
        {
          id: 2,
          type: "contact",
          description: "Contact updated: Sarah Johnson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          icon: "User"
        },
        {
          id: 3,
          type: "lead",
          description: "New lead qualified: David Chen",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          icon: "UserPlus"
        }
      ]

      setRecentActivity(mockActivity)
    } catch (err) {
      setError("Failed to load CRM dashboard data")
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ApperIcon name="Loader2" size={40} className="animate-spin text-primary-500 mb-4" />
          <p className="text-gray-500">Loading CRM dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={40} className="text-error mb-4" />
          <p className="text-error mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-surface border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                CRM Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your customer relationships and sales pipeline
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/crm/leads")}
                size="sm"
              >
                <ApperIcon name="UserPlus" size={16} className="mr-2" />
                View Leads
              </Button>
              <Button 
                variant="primary" 
                onClick={() => navigate("/crm/deals")}
              >
                <ApperIcon name="TrendingUp" size={16} className="mr-2" />
                Sales Pipeline
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Contacts Card */}
              <Card 
                variant="default" 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/crm/contacts")}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Contacts</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.contacts.total}</p>
                      <p className="text-sm text-gray-500">
                        {stats.contacts.active} active
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Users" size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Companies Card */}
              <Card 
                variant="default" 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/crm/companies")}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Companies</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.companies.total}</p>
                      <p className="text-sm text-gray-500">
                        {stats.companies.active} active
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Building2" size={24} className="text-green-600" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Deals Card */}
              <Card 
                variant="default" 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/crm/deals")}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Deals</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.deals.total}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(stats.deals.totalValue)} total value
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="HandHeart" size={24} className="text-purple-600" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Leads Card */}
              <Card 
                variant="default" 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/crm/leads")}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Leads</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.leads.total}</p>
                      <p className="text-sm text-gray-500">
                        {stats.leads.qualified} qualified
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="UserPlus" size={24} className="text-orange-600" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="MoreHorizontal" size={16} />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <ApperIcon name={activity.icon} size={16} className="text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {recentActivity.length === 0 && (
                      <div className="text-center py-8">
                        <ApperIcon name="Activity" size={40} className="text-gray-400 mb-4" />
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate("/crm/contacts")}
                      >
                        <ApperIcon name="UserPlus" size={16} className="mr-3" />
                        Add New Contact
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate("/crm/companies")}
                      >
                        <ApperIcon name="Building2" size={16} className="mr-3" />
                        Add New Company
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate("/crm/deals")}
                      >
                        <ApperIcon name="Plus" size={16} className="mr-3" />
                        Create New Deal
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate("/crm/leads")}
                      >
                        <ApperIcon name="Target" size={16} className="mr-3" />
                        Manage Leads
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Performance Summary */}
                <Card className="mt-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Avg Deal Value</span>
                          <span className="text-sm font-semibold">{formatCurrency(stats.deals.avgValue)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Lead Score Avg</span>
                          <span className="text-sm font-semibold">{stats.leads.avgScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${stats.leads.avgScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CRMDashboard