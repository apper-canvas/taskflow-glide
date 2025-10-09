import { toast } from "react-toastify"
import contactsData from "@/services/mockData/contacts.json"

// Utility function for realistic delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ContactService {
  constructor() {
    this.contacts = [...contactsData]
  }

  async getAll() {
    await delay(300)
    try {
      return [...this.contacts]
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast.error("Failed to load contacts")
      return []
    }
  }

  async getById(id) {
    await delay(200)
    try {
      const contact = this.contacts.find(c => c.Id === parseInt(id))
      if (!contact) {
        toast.error("Contact not found")
        return null
      }
      return { ...contact }
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error)
      toast.error("Failed to load contact")
      return null
    }
  }

  async create(contactData) {
    await delay(400)
    try {
      const newContact = {
        Id: Date.now(),
        firstName: contactData.firstName || "",
        lastName: contactData.lastName || "",
        email: contactData.email || "",
        phone: contactData.phone || "",
        title: contactData.title || "",
        companyId: contactData.companyId ? parseInt(contactData.companyId) : null,
        companyName: contactData.companyName || "",
        status: contactData.status || "active",
        source: contactData.source || "manual",
        lastContactDate: new Date().toISOString(),
        notes: contactData.notes || "",
        tags: Array.isArray(contactData.tags) ? contactData.tags : [],
        createdAt: new Date().toISOString()
      }

      this.contacts.push(newContact)
      toast.success("Contact created successfully")
      return { ...newContact }
    } catch (error) {
      console.error("Error creating contact:", error)
      toast.error("Failed to create contact")
      return null
    }
  }

  async update(id, contactData) {
    await delay(350)
    try {
      const index = this.contacts.findIndex(c => c.Id === parseInt(id))
      if (index === -1) {
        toast.error("Contact not found")
        return null
      }

      const updatedContact = {
        ...this.contacts[index],
        firstName: contactData.firstName || this.contacts[index].firstName,
        lastName: contactData.lastName || this.contacts[index].lastName,
        email: contactData.email || this.contacts[index].email,
        phone: contactData.phone || this.contacts[index].phone,
        title: contactData.title || this.contacts[index].title,
        companyId: contactData.companyId ? parseInt(contactData.companyId) : this.contacts[index].companyId,
        companyName: contactData.companyName || this.contacts[index].companyName,
        status: contactData.status || this.contacts[index].status,
        source: contactData.source || this.contacts[index].source,
        lastContactDate: contactData.lastContactDate || new Date().toISOString(),
        notes: contactData.notes !== undefined ? contactData.notes : this.contacts[index].notes,
        tags: Array.isArray(contactData.tags) ? contactData.tags : this.contacts[index].tags
      }

      this.contacts[index] = updatedContact
      toast.success("Contact updated successfully")
      return { ...updatedContact }
    } catch (error) {
      console.error("Error updating contact:", error)
      toast.error("Failed to update contact")
      return null
    }
  }

  async delete(id) {
    await delay(300)
    try {
      const index = this.contacts.findIndex(c => c.Id === parseInt(id))
      if (index === -1) {
        toast.error("Contact not found")
        return false
      }

      this.contacts.splice(index, 1)
      toast.success("Contact deleted successfully")
      return true
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast.error("Failed to delete contact")
      return false
    }
  }

  async search(query) {
    await delay(250)
    try {
      if (!query || query.trim() === "") {
        return [...this.contacts]
      }

      const searchTerm = query.toLowerCase().trim()
      return this.contacts.filter(contact =>
        contact.firstName.toLowerCase().includes(searchTerm) ||
        contact.lastName.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.companyName.toLowerCase().includes(searchTerm) ||
        contact.title.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      console.error("Error searching contacts:", error)
      return []
    }
  }

  async getByCompany(companyId) {
    await delay(200)
    try {
      return this.contacts.filter(contact => contact.companyId === parseInt(companyId))
    } catch (error) {
      console.error("Error fetching contacts by company:", error)
      return []
    }
  }

  async getByStatus(status) {
    await delay(200)
    try {
      return this.contacts.filter(contact => contact.status === status)
    } catch (error) {
      console.error("Error fetching contacts by status:", error)
      return []
    }
  }
}

export const contactService = new ContactService()