import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import { contactService } from "@/services/api/contactService"

const ContactsList = () => {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (err) {
      setError("Failed to load contacts")
      console.error("Error loading contacts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contactId) => {
    if (!confirm("Are you sure you want to delete this contact?")) return
    
    try {
      await contactService.delete(contactId)
      setContacts(prev => prev.filter(contact => contact.Id !== contactId))
    } catch (err) {
      console.error("Error deleting contact:", err)
    }
  }

  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(contact => contact.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(contact =>
        contact.firstName.toLowerCase().includes(search) ||
        contact.lastName.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.companyName.toLowerCase().includes(search) ||
        contact.title.toLowerCase().includes(search)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case "company":
          return a.companyName.localeCompare(b.companyName)
        case "recent":
          return new Date(b.lastContactDate) - new Date(a.lastContactDate)
        default:
          return 0
      }
    })

    return filtered
  }, [contacts, searchTerm, statusFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedContacts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedContacts = filteredAndSortedContacts.slice(startIndex, startIndex + itemsPerPage)

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
          <p className="text-gray-500">Loading contacts...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your customer contacts and relationships
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate("/crm/contacts/new")}
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Contact
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="company">Sort by Company</option>
                <option value="recent">Sort by Recent</option>
              </Select>
            </div>

            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedContacts.length)} of {filteredAndSortedContacts.length} contacts
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>

            {error && (
              <Card className="mb-6">
                <div className="p-6 text-center">
                  <ApperIcon name="AlertCircle" size={40} className="text-error mb-4" />
                  <p className="text-error mb-4">{error}</p>
                  <Button onClick={loadContacts} variant="outline">
                    <ApperIcon name="RefreshCw" size={16} className="mr-2" />
                    Retry
                  </Button>
                </div>
              </Card>
            )}

            {/* Contacts Grid */}
            {paginatedContacts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {paginatedContacts.map((contact) => (
                  <Card 
                    key={contact.Id} 
                    variant="default"
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => navigate(`/crm/contacts/${contact.Id}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-600">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{contact.title}</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(contact.status)}`}>
                          {contact.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="Building2" size={16} className="mr-2" />
                          {contact.companyName || "No company"}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="Mail" size={16} className="mr-2" />
                          {contact.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="Phone" size={16} className="mr-2" />
                          {contact.phone || "No phone"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Last contact: {formatDate(contact.lastContactDate)}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/crm/contacts/${contact.Id}`)
                            }}
                          >
                            <ApperIcon name="Eye" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(contact.Id)
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
                  <ApperIcon name="Users" size={64} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || statusFilter !== "all" 
                      ? "No contacts match your current filters" 
                      : "Get started by adding your first contact"
                    }
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button 
                      variant="primary" 
                      onClick={() => navigate("/crm/contacts/new")}
                    >
                      <ApperIcon name="Plus" size={16} className="mr-2" />
                      Add Your First Contact
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

export default ContactsList