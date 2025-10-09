import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { dealService } from "@/services/api/dealService"

const DealDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"
  
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(isNew)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    contactName: "",
    value: "",
    stage: "discovery",
    probability: "",
    expectedCloseDate: "",
    owner: "Sales Rep 1",
    source: "manual",
    description: "",
    notes: "",
    tags: []
  })

  const dealStages = [
    { value: "discovery", label: "Discovery" },
    { value: "qualification", label: "Qualification" },
    { value: "demo", label: "Demo" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closed-won", label: "Closed Won" },
    { value: "closed-lost", label: "Closed Lost" }
  ]

  const owners = ["Sales Rep 1", "Sales Rep 2", "Sales Rep 3"]
  const sources = ["manual", "website", "referral", "linkedin", "trade-show", "webinar", "cold-call"]

  useEffect(() => {
    if (!isNew) {
      loadDeal()
    }
  }, [id, isNew])

  const loadDeal = async () => {
    if (isNew) return
    
    setLoading(true)
    setError("")
    
    try {
      const data = await dealService.getById(id)
      if (data) {
        setDeal(data)
        setFormData({
          name: data.name || "",
          companyName: data.companyName || "",
          contactName: data.contactName || "",
          value: data.value ? data.value.toString() : "",
          stage: data.stage || "discovery",
          probability: data.probability ? data.probability.toString() : "",
          expectedCloseDate: data.expectedCloseDate || "",
          owner: data.owner || "Sales Rep 1",
          source: data.source || "manual",
          description: data.description || "",
          notes: data.notes || "",
          tags: data.tags || []
        })
      } else {
        navigate("/crm/deals")
      }
    } catch (err) {
      setError("Failed to load deal")
      console.error("Error loading deal:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.value || !formData.probability) {
      toast.error("Deal name, value, and probability are required")
      return
    }

    if (parseInt(formData.probability) < 0 || parseInt(formData.probability) > 100) {
      toast.error("Probability must be between 0 and 100")
      return
    }

    setSaving(true)
    
    try {
      let result
      if (isNew) {
        result = await dealService.create(formData)
        if (result) {
          toast.success("Deal created successfully!")
          navigate(`/crm/deals/${result.Id}`)
        }
      } else {
        result = await dealService.update(id, formData)
        if (result) {
          setDeal(result)
          setEditing(false)
          toast.success("Deal updated successfully!")
        }
      }
    } catch (err) {
      console.error("Error saving deal:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deal) return
    
    if (!confirm("Are you sure you want to delete this deal? This action cannot be undone.")) {
      return
    }

    try {
      await dealService.delete(deal.Id)
      navigate("/crm/deals")
    } catch (err) {
      console.error("Error deleting deal:", err)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return "Not specified"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString()
  }

  const getStageColor = (stage) => {
    switch (stage) {
      case "discovery": return "bg-gray-500"
      case "qualification": return "bg-blue-500"
      case "demo": return "bg-purple-500"
      case "proposal": return "bg-orange-500"
      case "negotiation": return "bg-yellow-500"
      case "closed-won": return "bg-green-500"
      case "closed-lost": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getProbabilityColor = (probability) => {
    if (probability >= 75) return "text-green-600"
    if (probability >= 50) return "text-yellow-600"
    if (probability >= 25) return "text-orange-600"
    return "text-red-600"
  }

  const getStageName = (stageValue) => {
    const stage = dealStages.find(s => s.value === stageValue)
    return stage ? stage.label : stageValue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ApperIcon name="Loader2" size={40} className="animate-spin text-primary-500 mb-4" />
          <p className="text-gray-500">Loading deal...</p>
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/crm/deals")}
              >
                <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
                Back to Deals
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNew ? "New Deal" : deal?.name}
                </h1>
                {!isNew && deal && (
                  <div className="flex items-center space-x-3 mt-1">
                    <p className="text-sm text-gray-500">{deal.companyName}</p>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getStageColor(deal.stage)}`}></div>
                      <span className="text-sm text-gray-500">{getStageName(deal.stage)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isNew && !editing && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    <ApperIcon name="Edit" size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl">
            {error && (
              <Card className="mb-6">
                <div className="p-6 text-center">
                  <ApperIcon name="AlertCircle" size={40} className="text-error mb-4" />
                  <p className="text-error mb-4">{error}</p>
                  <Button onClick={loadDeal} variant="outline">
                    <ApperIcon name="RefreshCw" size={16} className="mr-2" />
                    Retry
                  </Button>
                </div>
              </Card>
            )}

            {editing ? (
              // Edit Form
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    {isNew ? "Deal Information" : "Edit Deal"}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deal Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter deal name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <Input
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          placeholder="Enter company name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name
                        </label>
                        <Input
                          value={formData.contactName}
                          onChange={(e) => handleInputChange("contactName", e.target.value)}
                          placeholder="Enter contact name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deal Value *
                        </label>
                        <Input
                          type="number"
                          value={formData.value}
                          onChange={(e) => handleInputChange("value", e.target.value)}
                          placeholder="Enter deal value"
                          min="0"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Probability (%) *
                        </label>
                        <Input
                          type="number"
                          value={formData.probability}
                          onChange={(e) => handleInputChange("probability", e.target.value)}
                          placeholder="Enter probability"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stage
                        </label>
                        <Select
                          value={formData.stage}
                          onChange={(e) => handleInputChange("stage", e.target.value)}
                        >
                          {dealStages.map(stage => (
                            <option key={stage.value} value={stage.value}>{stage.label}</option>
                          ))}
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Close Date
                        </label>
                        <Input
                          type="date"
                          value={formData.expectedCloseDate}
                          onChange={(e) => handleInputChange("expectedCloseDate", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Owner
                        </label>
                        <Select
                          value={formData.owner}
                          onChange={(e) => handleInputChange("owner", e.target.value)}
                        >
                          {owners.map(owner => (
                            <option key={owner} value={owner}>{owner}</option>
                          ))}
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Source
                        </label>
                        <Select
                          value={formData.source}
                          onChange={(e) => handleInputChange("source", e.target.value)}
                        >
                          {sources.map(source => (
                            <option key={source} value={source} className="capitalize">{source}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Describe the deal opportunity..."
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Add notes about this deal..."
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => isNew ? navigate("/crm/deals") : setEditing(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={saving}
                      >
                        {saving && <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />}
                        {isNew ? "Create Deal" : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            ) : (
              // View Mode
              deal && (
                <div className="space-y-6">
                  {/* Deal Overview */}
                  <Card>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{deal.name}</h2>
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${getStageColor(deal.stage)}`}></div>
                              <span className="text-lg text-gray-600">{getStageName(deal.stage)}</span>
                            </div>
                            <span className={`text-lg font-medium ${getProbabilityColor(deal.probability)}`}>
                              {deal.probability}% probability
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(deal.value)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Deal Details */}
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <ApperIcon name="Building2" size={18} className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Company</p>
                              <p className="text-gray-900">{deal.companyName || "Not specified"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <ApperIcon name="User" size={18} className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Contact</p>
                              <p className="text-gray-900">{deal.contactName || "Not specified"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <ApperIcon name="UserCheck" size={18} className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Owner</p>
                              <p className="text-gray-900">{deal.owner}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <ApperIcon name="MapPin" size={18} className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Source</p>
                              <p className="text-gray-900 capitalize">{deal.source}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Timeline & Stats */}
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Expected Close Date</p>
                            <p className="text-lg text-gray-900">{formatDate(deal.expectedCloseDate)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="text-gray-900">{formatDate(deal.createdAt)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="text-gray-900">{formatDate(deal.updatedAt)}</p>
                          </div>

                          {deal.tags && deal.tags.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">Tags</p>
                              <div className="flex flex-wrap gap-2">
                                {deal.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Description */}
                  {deal.description && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{deal.description}</p>
                      </div>
                    </Card>
                  )}

                  {/* Notes */}
                  {deal.notes && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
                      </div>
                    </Card>
                  )}

                  {/* Activities */}
                  {deal.activities && deal.activities.length > 0 && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
                        <div className="space-y-4">
                          {deal.activities.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <ApperIcon name="Activity" size={14} className="text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900 capitalize">{activity.type}</span>
                                  <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{activity.description}</p>
                                {activity.outcome && (
                                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                    activity.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                                    activity.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {activity.outcome}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DealDetail