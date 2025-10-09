import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { contactService } from "@/services/api/contactService"

const ContactDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"
  
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(isNew)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    companyName: "",
    status: "active",
    source: "manual",
    notes: "",
    tags: []
  })

  useEffect(() => {
    if (!isNew) {
      loadContact()
    }
  }, [id, isNew])

  const loadContact = async () => {
    if (isNew) return
    
    setLoading(true)
    setError("")
    
    try {
      const data = await contactService.getById(id)
      if (data) {
        setContact(data)
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          title: data.title || "",
          companyName: data.companyName || "",
          status: data.status || "active",
          source: data.source || "manual",
          notes: data.notes || "",
          tags: data.tags || []
        })
      } else {
        navigate("/crm/contacts")
      }
    } catch (err) {
      setError("Failed to load contact")
      console.error("Error loading contact:", err)
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
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error("First name, last name, and email are required")
      return
    }

    setSaving(true)
    
    try {
      let result
      if (isNew) {
        result = await contactService.create(formData)
        if (result) {
          toast.success("Contact created successfully!")
          navigate(`/crm/contacts/${result.Id}`)
        }
      } else {
        result = await contactService.update(id, formData)
        if (result) {
          setContact(result)
          setEditing(false)
          toast.success("Contact updated successfully!")
        }
      }
    } catch (err) {
      console.error("Error saving contact:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!contact) return
    
    if (!confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
      return
    }

    try {
      await contactService.delete(contact.Id)
      navigate("/crm/contacts")
    } catch (err) {
      console.error("Error deleting contact:", err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
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
          <p className="text-gray-500">Loading contact...</p>
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
                onClick={() => navigate("/crm/contacts")}
              >
                <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
                Back to Contacts
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNew ? "New Contact" : `${contact?.firstName} ${contact?.lastName}`}
                </h1>
                {!isNew && contact && (
                  <p className="text-sm text-gray-500 mt-1">
                    {contact.title} at {contact.companyName}
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
                  <Button onClick={loadContact} variant="outline">
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
                    {isNew ? "Contact Information" : "Edit Contact"}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter email address"
                          required
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
                          Job Title
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="Enter job title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <Input
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          placeholder="Enter company name"
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
                          Source
                        </label>
                        <Select
                          value={formData.source}
                          onChange={(e) => handleInputChange("source", e.target.value)}
                        >
                          <option value="manual">Manual Entry</option>
                          <option value="website">Website</option>
                          <option value="referral">Referral</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="trade-show">Trade Show</option>
                          <option value="webinar">Webinar</option>
                          <option value="cold-call">Cold Call</option>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Add notes about this contact..."
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => isNew ? navigate("/crm/contacts") : setEditing(false)}
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
                        {isNew ? "Create Contact" : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            ) : (
              // View Mode
              contact && (
                <div className="space-y-6">
                  {/* Contact Overview */}
                  <Card>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-semibold text-blue-600">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </h2>
                            <p className="text-lg text-gray-600">{contact.title}</p>
                            <p className="text-gray-500">{contact.companyName}</p>
                          </div>
                        </div>
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(contact.status)}`}>
                          {contact.status}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Contact Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <ApperIcon name="Mail" size={18} className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="text-gray-900">{contact.email}</p>
                            </div>
                          </div>
                          
                          {contact.phone && (
                            <div className="flex items-center space-x-3">
                              <ApperIcon name="Phone" size={18} className="text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-gray-900">{contact.phone}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-3">
                            <ApperIcon name="MapPin" size={18} className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Source</p>
                              <p className="text-gray-900 capitalize">{contact.source}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Last Contact</p>
                            <p className="text-gray-900">{formatDate(contact.lastContactDate)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="text-gray-900">{formatDate(contact.createdAt)}</p>
                          </div>
                          
                          {contact.tags && contact.tags.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">Tags</p>
                              <div className="flex flex-wrap gap-2">
                                {contact.tags.map((tag, index) => (
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

                  {/* Notes */}
                  {contact.notes && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
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

export default ContactDetail