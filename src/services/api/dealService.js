import { toast } from "react-toastify"
import dealsData from "@/services/mockData/deals.json"

// Utility function for realistic delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class DealService {
  constructor() {
    this.deals = [...dealsData]
  }

  async getAll() {
    await delay(300)
    try {
      return [...this.deals]
    } catch (error) {
      console.error("Error fetching deals:", error)
      toast.error("Failed to load deals")
      return []
    }
  }

  async getById(id) {
    await delay(200)
    try {
      const deal = this.deals.find(d => d.Id === parseInt(id))
      if (!deal) {
        toast.error("Deal not found")
        return null
      }
      return { ...deal }
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error)
      toast.error("Failed to load deal")
      return null
    }
  }

  async create(dealData) {
    await delay(400)
    try {
      const newDeal = {
        Id: Date.now(),
        name: dealData.name || "",
        companyId: dealData.companyId ? parseInt(dealData.companyId) : null,
        companyName: dealData.companyName || "",
        contactId: dealData.contactId ? parseInt(dealData.contactId) : null,
        contactName: dealData.contactName || "",
        value: dealData.value ? parseFloat(dealData.value) : 0,
        stage: dealData.stage || "discovery",
        probability: dealData.probability ? parseInt(dealData.probability) : 0,
        expectedCloseDate: dealData.expectedCloseDate || "",
        owner: dealData.owner || "Sales Rep 1",
        source: dealData.source || "manual",
        description: dealData.description || "",
        notes: dealData.notes || "",
        tags: Array.isArray(dealData.tags) ? dealData.tags : [],
        activities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      this.deals.push(newDeal)
      toast.success("Deal created successfully")
      return { ...newDeal }
    } catch (error) {
      console.error("Error creating deal:", error)
      toast.error("Failed to create deal")
      return null
    }
  }

  async update(id, dealData) {
    await delay(350)
    try {
      const index = this.deals.findIndex(d => d.Id === parseInt(id))
      if (index === -1) {
        toast.error("Deal not found")
        return null
      }

      const updatedDeal = {
        ...this.deals[index],
        name: dealData.name || this.deals[index].name,
        companyId: dealData.companyId ? parseInt(dealData.companyId) : this.deals[index].companyId,
        companyName: dealData.companyName || this.deals[index].companyName,
        contactId: dealData.contactId ? parseInt(dealData.contactId) : this.deals[index].contactId,
        contactName: dealData.contactName || this.deals[index].contactName,
        value: dealData.value ? parseFloat(dealData.value) : this.deals[index].value,
        stage: dealData.stage || this.deals[index].stage,
        probability: dealData.probability ? parseInt(dealData.probability) : this.deals[index].probability,
        expectedCloseDate: dealData.expectedCloseDate || this.deals[index].expectedCloseDate,
        owner: dealData.owner || this.deals[index].owner,
        source: dealData.source || this.deals[index].source,
        description: dealData.description !== undefined ? dealData.description : this.deals[index].description,
        notes: dealData.notes !== undefined ? dealData.notes : this.deals[index].notes,
        tags: Array.isArray(dealData.tags) ? dealData.tags : this.deals[index].tags,
        updatedAt: new Date().toISOString()
      }

      this.deals[index] = updatedDeal
      toast.success("Deal updated successfully")
      return { ...updatedDeal }
    } catch (error) {
      console.error("Error updating deal:", error)
      toast.error("Failed to update deal")
      return null
    }
  }

  async delete(id) {
    await delay(300)
    try {
      const index = this.deals.findIndex(d => d.Id === parseInt(id))
      if (index === -1) {
        toast.error("Deal not found")
        return false
      }

      this.deals.splice(index, 1)
      toast.success("Deal deleted successfully")
      return true
    } catch (error) {
      console.error("Error deleting deal:", error)
      toast.error("Failed to delete deal")
      return false
    }
  }

  async getByStage(stage) {
    await delay(200)
    try {
      return this.deals.filter(deal => deal.stage === stage)
    } catch (error) {
      console.error("Error fetching deals by stage:", error)
      return []
    }
  }

  async getByOwner(owner) {
    await delay(200)
    try {
      return this.deals.filter(deal => deal.owner === owner)
    } catch (error) {
      console.error("Error fetching deals by owner:", error)
      return []
    }
  }

  async getByCompany(companyId) {
    await delay(200)
    try {
      return this.deals.filter(deal => deal.companyId === parseInt(companyId))
    } catch (error) {
      console.error("Error fetching deals by company:", error)
      return []
    }
  }

  async addActivity(dealId, activity) {
    await delay(250)
    try {
      const index = this.deals.findIndex(d => d.Id === parseInt(dealId))
      if (index === -1) {
        toast.error("Deal not found")
        return false
      }

      const newActivity = {
        date: new Date().toISOString(),
        type: activity.type || "note",
        description: activity.description || "",
        outcome: activity.outcome || "pending"
      }

      if (!this.deals[index].activities) {
        this.deals[index].activities = []
      }

      this.deals[index].activities.push(newActivity)
      this.deals[index].updatedAt = new Date().toISOString()
      
      toast.success("Activity added successfully")
      return true
    } catch (error) {
      console.error("Error adding activity:", error)
      toast.error("Failed to add activity")
      return false
    }
  }

  async getPipelineData() {
    await delay(200)
    try {
      const stages = ["discovery", "qualification", "demo", "proposal", "negotiation", "closed-won", "closed-lost"]
      const pipelineData = {}

      stages.forEach(stage => {
        const stageDeals = this.deals.filter(deal => deal.stage === stage)
        pipelineData[stage] = {
          deals: stageDeals,
          count: stageDeals.length,
          totalValue: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
          avgValue: stageDeals.length > 0 ? stageDeals.reduce((sum, deal) => sum + deal.value, 0) / stageDeals.length : 0
        }
      })

      return pipelineData
    } catch (error) {
      console.error("Error getting pipeline data:", error)
      return {}
    }
  }

  async search(query) {
    await delay(250)
    try {
      if (!query || query.trim() === "") {
        return [...this.deals]
      }

      const searchTerm = query.toLowerCase().trim()
      return this.deals.filter(deal =>
        deal.name.toLowerCase().includes(searchTerm) ||
        deal.companyName.toLowerCase().includes(searchTerm) ||
        deal.contactName.toLowerCase().includes(searchTerm) ||
        deal.description.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      console.error("Error searching deals:", error)
      return []
    }
  }
}

export const dealService = new DealService()