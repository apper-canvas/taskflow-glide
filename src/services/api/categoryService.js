import { toast } from "react-toastify"

class CategoryService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'category_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
      toast.error("Failed to load categories");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response?.data) {
        toast.error("Category not found");
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load category");
      return null;
    }
  }

  async create(categoryData) {
    try {
      const params = {
        records: [{
          // Only include Updateable fields
          Name: categoryData.Name || categoryData.name_c || categoryData.name,
          name_c: categoryData.name_c || categoryData.name,
          color_c: categoryData.color_c || categoryData.color,
          icon_c: categoryData.icon_c || categoryData.icon,
          is_custom_c: categoryData.is_custom_c !== undefined ? categoryData.is_custom_c : true
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} categories:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Category created successfully");
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
      toast.error("Failed to create category");
      return null;
    }
  }

  async update(id, categoryData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include Updateable fields
          Name: categoryData.Name || categoryData.name_c || categoryData.name,
          name_c: categoryData.name_c || categoryData.name,
          color_c: categoryData.color_c || categoryData.color,
          icon_c: categoryData.icon_c || categoryData.icon,
          is_custom_c: categoryData.is_custom_c !== undefined ? categoryData.is_custom_c : categoryData.isCustom
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} categories:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Category updated successfully");
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating category:", error?.response?.data?.message || error);
      toast.error("Failed to update category");
      return null;
    }
  }

  async delete(id) {
    try {
      // First check if it's a custom category
      const category = await this.getById(id);
      if (category && !category.is_custom_c) {
        toast.error("Cannot delete default category");
        return false;
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} categories:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Category deleted successfully");
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting category:", error?.response?.data?.message || error);
      toast.error("Failed to delete category");
      return false;
    }
  }

  // Backward compatibility methods
  async getCustomCategories() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        where: [{"FieldName": "is_custom_c", "Operator": "EqualTo", "Values": [true]}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.error("Error fetching custom categories:", error);
      return [];
    }
  }

  async getDefaultCategories() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        where: [{"FieldName": "is_custom_c", "Operator": "EqualTo", "Values": [false]}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.error("Error fetching default categories:", error);
      return [];
    }
  }
}

export const categoryService = new CategoryService()