import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { dealService } from "@/services/api/dealService"

const DealsList = () => {
  const navigate = useNavigate()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [sortBy, setSortBy] = useState("value")
  const [viewMode, setViewMode] = useState("pipeline") // pipeline or list
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const dealStages = [
    { value: "discovery", label: "Discovery", color: "bg-gray-500" },
    { value: "qualification", label: "Qualification", color: "bg-blue-500" },
    { value: "demo", label: "Demo", color: "bg-purple-500" },
    { value: "proposal", label: "Proposal", color: "bg-orange-500" },
    { value: "negotiation", label: "Negotiation", color: "bg-yellow-500" },
    { value: "closed-won", label: "Closed Won", color: "bg-green-500" },
    { value: "closed-lost", label: "Closed Lost", color: "bg-red-500" }
  ]

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await dealService.getAll()
      setDeals(data)
    } catch (err) {
      setError("Failed to load deals")
      console.error("Error loading deals:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (dealId) => {
    if (!confirm("Are you sure you want to delete this deal?")) return
    
    try {
      await dealService.delete(dealId)
      setDeals(prev => prev.filter(deal => deal.Id !== dealId))
    } catch (err) {
      console.error("Error deleting deal:", err)
    }
  }

  const handleStageUpdate = async (dealId, newStage) => {
    try {
      const updatedDeal = await dealService.update(dealId, { stage: newStage })
      if (updatedDeal) {
        setDeals(prev => prev.map(deal => 
          deal.Id === dealId ? { ...deal, stage: newStage } : deal
        ))
      }
    } catch (err) {
      console.error("Error updating deal stage:", err)
    }
  }

  // Get unique owners for filter
  const owners = useMemo(() => {
    const uniqueOwners = [...new Set(deals.map(d => d.owner))]
    return uniqueOwners.sort()
  }, [deals])

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals

    // Apply stage filter
    if (stageFilter !== "all") {
      filtered = filtered.filter(deal => deal.stage === stageFilter)
    }

    // Apply owner filter
    if (ownerFilter !== "all") {
      filtered = filtered.filter(deal => deal.owner === ownerFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(deal =>
        deal.name.toLowerCase().includes(search) ||
        deal.companyName.toLowerCase().includes(search) ||
        deal.contactName.toLowerCase().includes(search)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "value":
          return b.value - a.value
        case "probability":
          return b.probability - a.probability
        case "close-date":
          if (!a.expectedCloseDate && !b.expectedCloseDate) return 0
          if (!a.expectedCloseDate) return 1
          if (!b.expectedCloseDate) return -1
          return new Date(a.expectedCloseDate) - new Date(b.expectedCloseDate)
        case "recent":
          return new Date(b.updatedAt) - new Date(a.updatedAt)
        default:
          return 0
      }
    })

    return filtered
  }, [deals, searchTerm, stageFilter, ownerFilter, sortBy])

  const pipelineData = useMemo(() => {
    const pipeline = {}
    dealStages.forEach(stage => {
      const stageDeals = filteredAndSortedDeals.filter(deal => deal.stage === stage.value)
      pipeline[stage.value] = {
        ...stage,
        deals: stageDeals,
        count: stageDeals.length,
        totalValue: stageDeals.reduce((sum, deal) => sum + deal.value, 0)
      }
    })
    return pipeline
  }, [filteredAndSortedDeals])

  // Pagination for list view
  const totalPages = Math.ceil(filteredAndSortedDeals.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDeals = filteredAndSortedDeals.slice(startIndex, startIndex + itemsPerPage)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date"
    return new Date(dateString).toLocaleDateString()
  }

  const getProbabilityColor = (probability) => {
    if (probability >= 75) return "text-green-600"
    if (probability >= 50) return "text-yellow-600"
    if (probability >= 25) return "text-orange-600"
    return "text-red-600"
  }

  const getStageInfo = (stageName) => {
    return dealStages.find(stage => stage.value === stageName) || dealStages[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ApperIcon name="Loader2" size={40} className="animate-spin text-primary-500 mb-4" />
          <p className="text-gray-500">Loading deals...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage your sales opportunities
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "pipeline" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("pipeline")}
                >
                  <ApperIcon name="Kanban" size={16} className="mr-2" />
                  Pipeline
                </Button>
                <Button
                  variant={viewMode === "list" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <ApperIcon name="List" size={16} className="mr-2" />
                  List
                </Button>
              </div>
              <Button 
                variant="primary" 
                onClick={() => navigate("/crm/deals/new")}
              >
                <ApperIcon name="Plus" size={16} className="mr-2" />
                New Deal
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-full">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="all">All Stages</option>
                {dealStages.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </Select>
              <Select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
              >
                <option value="all">All Owners</option>
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="value">Sort by Value</option>
                <option value="probability">Sort by Probability</option>
                <option value="close-date">Sort by Close Date</option>
                <option value="recent">Sort by Recent</option>
              </Select>
            </div>

            {error && (
              <Card className="mb-6">
                <div className="p-6 text-center">
                  <ApperIcon name="AlertCircle" size={40} className="text-error mb-4" />
                  <p className="text-error mb-4">{error}</p>
                  <Button onClick={loadDeals} variant="outline">
                    <ApperIcon name="RefreshCw" size={16} className="mr-2" />
                    Retry
                  </Button>
                </div>
              </Card>
            )}

            {viewMode === "pipeline" ? (
              // Pipeline View
              <div className="overflow-x-auto">
                <div className="flex space-x-6 pb-4" style={{ minWidth: '1400px' }}>
                  {dealStages.map((stage) => {
                    const stageData = pipelineData[stage.value]
                    return (
                      <div key={stage.value} className="flex-shrink-0 w-80">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                              <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                              <span className="text-sm text-gray-500">({stageData.count})</span>
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                              {formatCurrency(stageData.totalValue)}
                            </div>
                          </div>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {stageData.deals.map((deal) => (
                              <Card 
                                key={deal.Id}
                                variant="default"
                                className="cursor-pointer hover:shadow-md transition-all"
                                onClick={() => navigate(`/crm/deals/${deal.Id}`)}
                              >
                                <div className="p-4">
                                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                    {deal.name}
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <ApperIcon name="Building2" size={14} className="mr-2" />
                                      {deal.companyName}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-lg font-semibold text-gray-900">
                                        {formatCurrency(deal.value)}
                                      </span>
                                      <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                                        {deal.probability}%
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Close: {formatDate(deal.expectedCloseDate)}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                            
                            {stageData.deals.length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                                <ApperIcon name="Inbox" size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No deals in this stage</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              // List View
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedDeals.length)} of {filteredAndSortedDeals.length} deals
                    {searchTerm && ` matching "${searchTerm}"`}
                  </p>
                </div>

                {paginatedDeals.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                    {paginatedDeals.map((deal) => {
                      const stageInfo = getStageInfo(deal.stage)
                      return (
                        <Card 
                          key={deal.Id} 
                          variant="default"
                          className="cursor-pointer hover:shadow-lg transition-all"
                          onClick={() => navigate(`/crm/deals/${deal.Id}`)}
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                                  {deal.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">{deal.companyName}</p>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${stageInfo.color}`}></div>
                                  <span className="text-xs text-gray-600">{stageInfo.label}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Value</span>
                                <span className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(deal.value)}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Probability</span>
                                <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                                  {deal.probability}%
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Close Date</span>
                                <span className="text-sm text-gray-900">
                                  {formatDate(deal.expectedCloseDate)}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Owner</span>
                                <span className="text-sm text-gray-900">{deal.owner}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/crm/deals/${deal.Id}`)
                                  }}
                                >
                                  <ApperIcon name="Eye" size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(deal.Id)
                                  }}
                                >
                                  <ApperIcon name="Trash2" size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card>
                    <div className="p-12 text-center">
                      <ApperIcon name="HandHeart" size={64} className="text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm || stageFilter !== "all" || ownerFilter !== "all"
                          ? "No deals match your current filters" 
                          : "Get started by creating your first deal"
                        }
                      </p>
                      {!searchTerm && stageFilter === "all" && ownerFilter === "all" && (
                        <Button 
                          variant="primary" 
                          onClick={() => navigate("/crm/deals/new")}
                        >
                          <ApperIcon name="Plus" size={16} className="mr-2" />
                          Create Your First Deal
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
            )}

            {/* Pipeline Summary */}
            <Card className="mt-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredAndSortedDeals.length}
                    </p>
                    <p className="text-sm text-gray-500">Total Deals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(filteredAndSortedDeals.reduce((sum, deal) => sum + deal.value, 0))}
                    </p>
                    <p className="text-sm text-gray-500">Pipeline Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredAndSortedDeals.length > 0 ? 
                        formatCurrency(filteredAndSortedDeals.reduce((sum, deal) => sum + deal.value, 0) / filteredAndSortedDeals.length) :
                        formatCurrency(0)
                      }
                    </p>
                    <p className="text-sm text-gray-500">Avg Deal Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredAndSortedDeals.length > 0 ?
                        Math.round(filteredAndSortedDeals.reduce((sum, deal) => sum + deal.probability, 0) / filteredAndSortedDeals.length) :
                        0
                      }%
                    </p>
                    <p className="text-sm text-gray-500">Avg Probability</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DealsList