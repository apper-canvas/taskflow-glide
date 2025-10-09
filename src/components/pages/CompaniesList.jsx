import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { companyService } from "@/services/api/companyService"

const CompaniesList = () => {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [tierFilter, setTierFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await companyService.getAll()
      setCompanies(data)
    } catch (err) {
      setError("Failed to load companies")
      console.error("Error loading companies:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (companyId) => {
    if (!confirm("Are you sure you want to delete this company?")) return
    
    try {
      await companyService.delete(companyId)
      setCompanies(prev => prev.filter(company => company.Id !== companyId))
    } catch (err) {
      console.error("Error deleting company:", err)
    }
  }

  // Get unique industries for filter
  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(companies.map(c => c.industry))]
    return uniqueIndustries.sort()
  }, [companies])

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies

    // Apply industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(company => company.industry === industryFilter)
    }

    // Apply tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter(company => company.tier === tierFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(search) ||
        company.industry.toLowerCase().includes(search) ||
        company.primaryContact.toLowerCase().includes(search)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "revenue":
          return b.revenue - a.revenue
        case "employees":
          return b.employees - a.employees
        case "recent":
          return new Date(b.lastActivity) - new Date(a.lastActivity)
        default:
          return 0
      }
    })

    return filtered
  }, [companies, searchTerm, industryFilter, tierFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCompanies = filteredAndSortedCompanies.slice(startIndex, startIndex + itemsPerPage)

  const formatCurrency = (value) => {
    if (!value) return "N/A"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatEmployeeCount = (count) => {
    if (!count) return "N/A"
    return count.toLocaleString()
  }

  const getTierBadgeClass = (tier) => {
    switch (tier) {
      case "enterprise":
        return "bg-purple-100 text-purple-800"
      case "mid-market":
        return "bg-blue-100 text-blue-800"
      case "small":
        return "bg-green-100 text-green-800"
      case "startup":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "prospect":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ApperIcon name="Loader2" size={40} className="animate-spin text-primary-500 mb-4" />
          <p className="text-gray-500">Loading companies...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your company accounts and relationships
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate("/crm/companies/new")}
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Company
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </Select>
              <Select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <option value="all">All Tiers</option>
                <option value="enterprise">Enterprise</option>
                <option value="mid-market">Mid-market</option>
                <option value="small">Small</option>
                <option value="startup">Startup</option>
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="employees">Sort by Employees</option>
                <option value="recent">Sort by Recent</option>
              </Select>
            </div>

            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedCompanies.length)} of {filteredAndSortedCompanies.length} companies
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>

            {error && (
              <Card className="mb-6">
                <div className="p-6 text-center">
                  <ApperIcon name="AlertCircle" size={40} className="text-error mb-4" />
                  <p className="text-error mb-4">{error}</p>
                  <Button onClick={loadCompanies} variant="outline">
                    <ApperIcon name="RefreshCw" size={16} className="mr-2" />
                    Retry
                  </Button>
                </div>
              </Card>
            )}

            {/* Companies Grid */}
            {paginatedCompanies.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {paginatedCompanies.map((company) => (
                  <Card 
                    key={company.Id} 
                    variant="default"
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => navigate(`/crm/companies/${company.Id}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {company.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">{company.industry}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTierBadgeClass(company.tier)}`}>
                              {company.tier}
                            </span>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(company.status)}`}>
                              {company.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="User" size={14} className="mr-2" />
                          {company.primaryContact || "No primary contact"}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="Users" size={14} className="mr-2" />
                          {formatEmployeeCount(company.employees)} employees
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="DollarSign" size={14} className="mr-2" />
                          {formatCurrency(company.revenue)} revenue
                        </div>
                        {company.website && (
                          <div className="flex items-center text-sm text-gray-600">
                            <ApperIcon name="Globe" size={14} className="mr-2" />
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-primary-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {company.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {company.size}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/crm/companies/${company.Id}`)
                            }}
                          >
                            <ApperIcon name="Eye" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(company.Id)
                            }}
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="p-12 text-center">
                  <ApperIcon name="Building2" size={64} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || industryFilter !== "all" || tierFilter !== "all"
                      ? "No companies match your current filters" 
                      : "Get started by adding your first company"
                    }
                  </p>
                  {!searchTerm && industryFilter === "all" && tierFilter === "all" && (
                    <Button 
                      variant="primary" 
                      onClick={() => navigate("/crm/companies/new")}
                    >
                      <ApperIcon name="Plus" size={16} className="mr-2" />
                      Add Your First Company
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ApperIcon name="ChevronLeft" size={16} />
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ApperIcon name="ChevronRight" size={16} />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CompaniesList