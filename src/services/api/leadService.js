import { toast } from "react-toastify"
import leadsData from "@/services/mockData/leads.json"

// Utility function for realistic delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class LeadService {
  constructor() {
    this.leads = [...leadsData]
  }

  async getAll() {
    await delay(300)
    try {
      return [...this.leads]
    } catch (error) {
      console.error("Error fetching leads:", error)
      toast.error("Failed to load leads")
      return []
    }
  }

  async getById(id) {
    await delay(200)
    try {
      const lead = this.leads.find(l => l.Id === parseInt(id))
      if (!lead) {
        toast.error("Lead not found")
        return null
      }
      return { ...lead }
    } catch (error) {
      console.error(`Error fetching lead ${id}:`, error)
      toast.error("Failed to load lead")
      return null
    }
  }

  async create(leadData) {
    await delay(400)
    try {
      const newLead = {
        Id: Date.now(),
        firstName: leadData.firstName || "",
        lastName: leadData.lastName || "",
        email: leadData.email || "",
        phone: leadData.phone || "",
        company: leadData.company || "",
        title: leadData.title || "",
        industry: leadData.industry || "",
        leadSource: leadData.leadSource || "manual",
        status: leadData.status || "new",
        score: leadData.score ? parseInt(leadData.score) : 0,
        budget: leadData.budget ? parseInt(leadData.budget) : 0,
        timeline: leadData.timeline || "",
        notes: leadData.notes || "",
        tags: Array.isArray(leadData.tags) ? leadData.tags : [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        assignedTo: leadData.assignedTo || "Sales Rep 1"
      }

      this.leads.push(newLead)
      toast.success("Lead created successfully")
      return { ...newLead }
    } catch (error) {
      console.error("Error creating lead:", error)
      toast.error("Failed to create lead")
      return null
    }
  }

  async update(id, leadData) {
    await delay(350)
    try {
      const index = this.leads.findIndex(l => l.Id === parseInt(id))
      if (index === -1) {
        toast.error("Lead not found")
        return null
      }

      const updatedLead = {
        ...this.leads[index],
        firstName: leadData.firstName || this.leads[index].firstName,
        lastName: leadData.lastName || this.leads[index].lastName,
        email: leadData.email || this.leads[index].email,
        phone: leadData.phone || this.leads[index].phone,
        company: leadData.company || this.leads[index].company,
        title: leadData.title || this.leads[index].title,
        industry: leadData.industry || this.leads[index].industry,
        leadSource: leadData.leadSource || this.leads[index].leadSource,
        status: leadData.status || this.leads[index].status,
        score: leadData.score ? parseInt(leadData.score) : this.leads[index].score,
        budget: leadData.budget ? parseInt(leadData.budget) : this.leads[index].budget,
        timeline: leadData.timeline || this.leads[index].timeline,
        notes: leadData.notes !== undefined ? leadData.notes : this.leads[index].notes,
        tags: Array.isArray(leadData.tags) ? leadData.tags : this.leads[index].tags,
        lastActivity: new Date().toISOString(),
        assignedTo: leadData.assignedTo || this.leads[index].assignedTo
      }

      this.leads[index] = updatedLead
      toast.success("Lead updated successfully")
      return { ...updatedLead }
    } catch (error) {
      console.error("Error updating lead:", error)
      toast.error("Failed to update lead")
      return null
    }
  }

  async delete(id) {
    await delay(300)
    try {
      const index = this.leads.findIndex(l => l.Id === parseInt(id))
      if (index === -1) {
        toast.error("Lead not found")
        return false
      }

      this.leads.splice(index, 1)
      toast.success("Lead deleted successfully")
      return true
    } catch (error) {
      console.error("Error deleting lead:", error)
      toast.error("Failed to delete lead")
      return false
    }
  }

  async getByStatus(status) {
    await delay(200)
    try {
      return this.leads.filter(lead => lead.status === status)
    } catch (error) {
      console.error("Error fetching leads by status:", error)
      return []
    }
  }

  async getBySource(source) {
    await delay(200)
    try {
      return this.leads.filter(lead => lead.leadSource === source)
    } catch (error) {
      console.error("Error fetching leads by source:", error)
      return []
    }
  }

  async getByAssignee(assignee) {
    await delay(200)
    try {
      return this.leads.filter(lead => lead.assignedTo === assignee)
    } catch (error) {
      console.error("Error fetching leads by assignee:", error)
      return []
    }
  }

  async convertToContact(id, contactData = {}) {
    await delay(400)
    try {
      const leadIndex = this.leads.findIndex(l => l.Id === parseInt(id))
      if (leadIndex === -1) {
        toast.error("Lead not found")
        return null
      }

      const lead = this.leads[leadIndex]
      
      // Convert lead to contact format
      const convertedContact = {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        title: lead.title,
        companyName: lead.company,
        status: "active",
        source: lead.leadSource,
        notes: `Converted from lead. Original notes: ${lead.notes}`,
        tags: [...(lead.tags || []), "converted-lead"],
        ...contactData
      }

      // Remove the lead
      this.leads.splice(leadIndex, 1)
      
      toast.success("Lead converted to contact successfully")
      return convertedContact
    } catch (error) {
      console.error("Error converting lead:", error)
      toast.error("Failed to convert lead")
      return null
    }
  }

  async search(query) {
    await delay(250)
    try {
      if (!query || query.trim() === "") {
        return [...this.leads]
      }

      const searchTerm = query.toLowerCase().trim()
      return this.leads.filter(lead =>
        lead.firstName.toLowerCase().includes(searchTerm) ||
        lead.lastName.toLowerCase().includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm) ||
        lead.company.toLowerCase().includes(searchTerm) ||
        lead.title.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      console.error("Error searching leads:", error)
      return []
    }
  }

  async updateScore(id, newScore) {
    await delay(200)
    try {
      const index = this.leads.findIndex(l => l.Id === parseInt(id))
      if (index === -1) {
        toast.error("Lead not found")
        return false
      }

      this.leads[index].score = parseInt(newScore)
      this.leads[index].lastActivity = new Date().toISOString()
      
      toast.success("Lead score updated")
      return true
    } catch (error) {
      console.error("Error updating lead score:", error)
      toast.error("Failed to update lead score")
      return false
    }
  }

  async getLeadStats() {
    await delay(200)
    try {
      const stats = {
        total: this.leads.length,
        new: this.leads.filter(l => l.status === "new").length,
        contacted: this.leads.filter(l => l.status === "contacted").length,
        qualified: this.leads.filter(l => l.status === "qualified").length,
        nurturing: this.leads.filter(l => l.status === "nurturing").length,
        avgScore: this.leads.length > 0 ? 
          Math.round(this.leads.reduce((sum, lead) => sum + lead.score, 0) / this.leads.length) : 0,
        totalBudget: this.leads.reduce((sum, lead) => sum + lead.budget, 0)
      }
      
      return stats
    } catch (error) {
      console.error("Error getting lead stats:", error)
      return {}
    }
  }
}

export const leadService = new LeadService()