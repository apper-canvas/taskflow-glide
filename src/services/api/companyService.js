import { toast } from "react-toastify"
import companiesData from "@/services/mockData/companies.json"

// Utility function for realistic delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class CompanyService {
  constructor() {
    this.companies = [...companiesData]
  }

  async getAll() {
    await delay(300)
    try {
      return [...this.companies]
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast.error("Failed to load companies")
      return []
    }
  }

  async getById(id) {
    await delay(200)
    try {
      const company = this.companies.find(c => c.Id === parseInt(id))
      if (!company) {
        toast.error("Company not found")
        return null
      }
      return { ...company }
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error)
      toast.error("Failed to load company")
      return null
    }
  }

  async create(companyData) {
    await delay(400)
    try {
      const newCompany = {
        Id: Date.now(),
        name: companyData.name || "",
        industry: companyData.industry || "",
        size: companyData.size || "",
        website: companyData.website || "",
        phone: companyData.phone || "",
        address: companyData.address || "",
        status: companyData.status || "active",
        tier: companyData.tier || "small",
        revenue: companyData.revenue ? parseInt(companyData.revenue) : 0,
        employees: companyData.employees ? parseInt(companyData.employees) : 0,
        primaryContact: companyData.primaryContact || "",
        notes: companyData.notes || "",
        tags: Array.isArray(companyData.tags) ? companyData.tags : [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }

      this.companies.push(newCompany)
      toast.success("Company created successfully")
      return { ...newCompany }
    } catch (error) {
      console.error("Error creating company:", error)
      toast.error("Failed to create company")
      return null
    }
  }

  async update(id, companyData) {
    await delay(350)
    try {
      const index = this.companies.findIndex(c => c.Id === parseInt(id))
      if (index === -1) {
        toast.error("Company not found")
        return null
      }

      const updatedCompany = {
        ...this.companies[index],
        name: companyData.name || this.companies[index].name,
        industry: companyData.industry || this.companies[index].industry,
        size: companyData.size || this.companies[index].size,
        website: companyData.website || this.companies[index].website,
        phone: companyData.phone || this.companies[index].phone,
        address: companyData.address || this.companies[index].address,
        status: companyData.status || this.companies[index].status,
        tier: companyData.tier || this.companies[index].tier,
        revenue: companyData.revenue ? parseInt(companyData.revenue) : this.companies[index].revenue,
        employees: companyData.employees ? parseInt(companyData.employees) : this.companies[index].employees,
        primaryContact: companyData.primaryContact || this.companies[index].primaryContact,
        notes: companyData.notes !== undefined ? companyData.notes : this.companies[index].notes,
        tags: Array.isArray(companyData.tags) ? companyData.tags : this.companies[index].tags,
        lastActivity: new Date().toISOString()
      }

      this.companies[index] = updatedCompany
      toast.success("Company updated successfully")
      return { ...updatedCompany }
    } catch (error) {
      console.error("Error updating company:", error)
      toast.error("Failed to update company")
      return null
    }
  }

  async delete(id) {
    await delay(300)
    try {
      const index = this.companies.findIndex(c => c.Id === parseInt(id))
      if (index === -1) {
        toast.error("Company not found")
        return false
      }

      this.companies.splice(index, 1)
      toast.success("Company deleted successfully")
      return true
    } catch (error) {
      console.error("Error deleting company:", error)
      toast.error("Failed to delete company")
      return false
    }
  }

  async search(query) {
    await delay(250)
    try {
      if (!query || query.trim() === "") {
        return [...this.companies]
      }

      const searchTerm = query.toLowerCase().trim()
      return this.companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm) ||
        company.industry.toLowerCase().includes(searchTerm) ||
        company.primaryContact.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      console.error("Error searching companies:", error)
      return []
    }
  }

  async getByTier(tier) {
    await delay(200)
    try {
      return this.companies.filter(company => company.tier === tier)
    } catch (error) {
      console.error("Error fetching companies by tier:", error)
      return []
    }
  }

  async getByIndustry(industry) {
    await delay(200)
    try {
      return this.companies.filter(company => company.industry === industry)
    } catch (error) {
      console.error("Error fetching companies by industry:", error)
      return []
    }
  }

  async getActiveCompanies() {
    await delay(200)
    try {
      return this.companies.filter(company => company.status === "active")
    } catch (error) {
      console.error("Error fetching active companies:", error)
      return []
    }
  }
}

export const companyService = new CompanyService()