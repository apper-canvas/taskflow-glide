import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { companyService } from "@/services/api/companyService"
import { contactService } from "@/services/api/contactService"

const CompanyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"
  
  const [company, setCompany] = useState(null)
  const [relatedContacts, setRelatedContacts] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(isNew)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "",
    website: "",
    phone: "",
    address: "",
    status: "active",
    tier: "small",
    revenue: "",
    employees: "",
    primaryContact: "",
    notes: "",
    tags: []
  })

  useEffect(() => {
    if (!isNew) {
      loadCompany()
      loadRelatedContacts()
    }
  }, [id, isNew])

  const loadCompany = async () => {
    if (isNew) return
    
    setLoading(true)
    setError("")
    
    try {
      const data = await companyService.getById(id)
      if (data) {
        setCompany(data)
        setFormData({
          name: data.name || "",
          industry: data.industry || "",
          size: data.size || "",
          website: data.website || "",
          phone: data.phone || "",
          address: data.address || "",
          status: data.status || "active",
          tier: data.tier || "small",
          revenue: data.revenue ? data.revenue.toString() : "",
          employees: data.employees ? data.employees.toString() : "",
          primaryContact: data.primaryContact || "",
          notes: data.notes || "",
          tags: data.tags || []
        })
      } else {
        navigate("/crm/companies")
      }
    } catch (err) {
      setError("Failed to load company")
      console.error("Error loading company:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedContacts = async () => {
    if (isNew) return
    
    try {
      const contacts = await contactService.getByCompany(id)
      setRelatedContacts(contacts)
    } catch (err) {
      console.error("Error loading related contacts:", err)
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
    if (!formData.name.trim()) {
      toast.error("Company name is required")
      return
    }

    setSaving(true)
    
    try {
      let result
      if (isNew) {
        result = await companyService.create(formData)
        if (result) {
          toast.success("Company created successfully!")
          navigate(`/crm/companies/${result.Id}`)
        }
      } else {
        result = await companyService.update(id, formData)
        if (result) {
          setCompany(result)
          setEditing(false)
          toast.success("Company updated successfully!")
        }
      }
    } catch (err) {
      console.error("Error saving company:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!company) return
    
    if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      return
    }

    try {
      await companyService.delete(company.Id)
      navigate("/crm/companies")
    } catch (err) {
      console.error("Error deleting company:", err)
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
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
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
          <p className="text-gray-500">Loading company...</p>
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
                onClick={() => navigate("/crm/companies")}
              >
                <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
                Back to Companies
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNew ? "New Company" : company?.name}
                </h1>
                {!isNew && company && (
                  <p className="text-sm text-gray-500 mt-1">
                    {company.industry} • {company.size}
                  </p>
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
                  <Button onClick={loadCompany} variant="outline">
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
                    {isNew ? "Company Information" : "Edit Company"}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <Input
                          value={formData.industry}
                          onChange={(e) => handleInputChange("industry", e.target.value)}
                          placeholder="e.g., Technology, Healthcare"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Size
                        </label>
                        <Select
                          value={formData.size}
                          onChange={(e) => handleInputChange("size", e.target.value)}
                        >
                          <option value="">Select size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="10-25">10-25 employees</option>
                          <option value="25-50">25-50 employees</option>
                          <option value="50-100">50-100 employees</option>
                          <option value="100-250">100-250 employees</option>
                          <option value="250-500">250-500 employees</option>
                          <option value="500-1000">500-1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <Input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          placeholder="https://company.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <Select
                          value={formData.status}
                          onChange={(e) => handleInputChange("status", e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="prospect">Prospect</option>
                          <option value="inactive">Inactive</option>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tier
                        </label>
                        <Select
                          value={formData.tier}
                          onChange={(e) => handleInputChange("tier", e.target.value)}
                        >
                          <option value="startup">Startup</option>
                          <option value="small">Small</option>
                          <option value="mid-market">Mid-market</option>
                          <option value="enterprise">Enterprise</option>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Annual Revenue
                        </label>
                        <Input
                          type="number"
                          value={formData.revenue}
                          onChange={(e) => handleInputChange("revenue", e.target.value)}
                          placeholder="Enter annual revenue"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee Count
                        </label>
                        <Input
                          type="number"
                          value={formData.employees}
                          onChange={(e) => handleInputChange("employees", e.target.value)}
                          placeholder="Enter employee count"
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Contact
                        </label>
                        <Input
                          value={formData.primaryContact}
                          onChange={(e) => handleInputChange("primaryContact", e.target.value)}
                          placeholder="Enter primary contact name"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <Input
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Enter company address"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Add notes about this company..."
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => isNew ? navigate("/crm/companies") : setEditing(false)}
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
                        {isNew ? "Create Company" : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            ) : (
              // View Mode
              company && (
                <div className="space-y-6">
                  {/* Company Overview */}
                  <Card>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ApperIcon name="Building2" size={32} className="text-blue-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
                            <p className="text-lg text-gray-600">{company.industry}</p>
                            <p className="text-gray-500">{company.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getTierBadgeClass(company.tier)}`}>
                            {company.tier}
                          </span>
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(company.status)}`}>
                            {company.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Company Details */}
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                        <div className="space-y-4">
                          {company.website && (
                            <div className="flex items-center space-x-3">
                              <ApperIcon name="Globe" size={18} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Website</p>
                                <a 
                                  href={company.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  {company.website}
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {company.phone && (
                            <div className="flex items-center space-x-3">
                              <ApperIcon name="Phone" size={18} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-gray-900">{company.phone}</p>
                              </div>
                            </div>
                          )}
                          
                          {company.address && (
                            <div className="flex items-center space-x-3">
                              <ApperIcon name="MapPin" size={18} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="text-gray-900">{company.address}</p>
                              </div>
                            </div>
                          )}

                          {company.primaryContact && (
                            <div className="flex items-center space-x-3">
                              <ApperIcon name="User" size={18} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Primary Contact</p>
                                <p className="text-gray-900">{company.primaryContact}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Financial & Stats */}
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Annual Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(company.revenue)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Employees</p>
                            <p className="text-2xl font-bold text-gray-900">{company.employees?.toLocaleString() || "Not specified"}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Last Activity</p>
                            <p className="text-gray-900">{formatDate(company.lastActivity)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="text-gray-900">{formatDate(company.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Related Contacts */}
                  {relatedContacts.length > 0 && (
                    <Card>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Related Contacts ({relatedContacts.length})</h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate("/crm/contacts/new", { state: { companyId: company.Id, companyName: company.name } })}
                          >
                            <ApperIcon name="Plus" size={14} className="mr-2" />
                            Add Contact
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {relatedContacts.map((contact) => (
                            <div 
                              key={contact.Id}
                              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => navigate(`/crm/contacts/${contact.Id}`)}
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-600">
                                  {contact.firstName[0]}{contact.lastName[0]}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {contact.firstName} {contact.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{contact.title}</p>
                              </div>
                              <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Notes */}
                  {company.notes && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{company.notes}</p>
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

export default CompanyDetail