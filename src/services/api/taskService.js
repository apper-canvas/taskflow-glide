import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

// Custom action base URL for description generation
const GENERATE_DESCRIPTION_URL = `https://test-api.apper.io/fn/${import.meta.env.VITE_GENERATE_TASK_DESCRIPTION}`;

class TaskService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'task_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
{"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "is_recurring_c"}},
          {"field": {"Name": "recurring_frequency_c"}},
          {"field": {"Name": "recurring_start_date_c"}},
          {"field": {"Name": "recurring_end_date_c"}},
          {"field": {"Name": "recurring_enabled_c"}},
          {"field": {"Name": "parent_task_id_c"}},
          {"field": {"Name": "generated_description_c"}},
          {"field": {"Name": "subcategory_c"}},
          {"field": {"Name": "urgency_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      toast.error("Failed to load tasks");
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "is_recurring_c"}},
          {"field": {"Name": "recurring_frequency_c"}},
          {"field": {"Name": "recurring_start_date_c"}},
          {"field": {"Name": "recurring_end_date_c"}},
          {"field": {"Name": "recurring_enabled_c"}},
          {"field": {"Name": "parent_task_id_c"}},
          {"field": {"Name": "generated_description_c"}},
          {"field": {"Name": "subcategory_c"}},
          {"field": {"Name": "urgency_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response?.data) {
        toast.error("Task not found");
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load task");
      return null;
    }
  }

  async create(taskData) {
    try {
      const params = {
        records: [{
          // Only include Updateable fields
title_c: taskData.title_c || taskData.title,
          description_c: taskData.description_c || taskData.description,
          category_c: parseInt(taskData.category_c || taskData.category),
          priority_c: taskData.priority_c || taskData.priority,
          due_date_c: taskData.due_date_c || taskData.dueDate,
          completed_c: taskData.completed_c !== undefined ? taskData.completed_c : false,
          completed_at_c: taskData.completed_at_c || null,
          is_recurring_c: taskData.is_recurring_c !== undefined ? taskData.is_recurring_c : (taskData.isRecurring || false),
          recurring_frequency_c: taskData.recurring_frequency_c || taskData.recurringFrequency,
          recurring_start_date_c: taskData.recurring_start_date_c || taskData.recurringStartDate,
          recurring_end_date_c: taskData.recurring_end_date_c || taskData.recurringEndDate,
          recurring_enabled_c: taskData.recurring_enabled_c !== undefined ? taskData.recurring_enabled_c : (taskData.recurringEnabled || false),
          parent_task_id_c: taskData.parent_task_id_c || taskData.parentTaskId || null,
          generated_description_c: taskData.generated_description_c || taskData.generatedDescription || null,
          subcategory_c: taskData.subcategory_c ? parseInt(taskData.subcategory_c) : null,
          urgency_c: taskData.urgency_c || taskData.urgency || null
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
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Task created successfully");
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      toast.error("Failed to create task");
      return null;
    }
  }

  // Generate task description using OpenAI API
  async generateDescription(title) {
    try {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new Error('Title is required to generate description');
      }

      const response = await fetch(GENERATE_DESCRIPTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title.trim() })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate description');
      }

      return data.description;
    } catch (error) {
      console.error('Error generating task description:', error);
      toast.error(`Failed to generate description: ${error.message}`);
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          // Only include Updateable fields
title_c: taskData.title_c || taskData.title,
          description_c: taskData.description_c || taskData.description,
          category_c: parseInt(taskData.category_c || taskData.category),
          priority_c: taskData.priority_c || taskData.priority,
          due_date_c: taskData.due_date_c || taskData.dueDate,
          completed_c: taskData.completed_c !== undefined ? taskData.completed_c : taskData.completed,
          completed_at_c: taskData.completed_at_c || taskData.completedAt,
          is_recurring_c: taskData.is_recurring_c !== undefined ? taskData.is_recurring_c : taskData.isRecurring,
          recurring_frequency_c: taskData.recurring_frequency_c || taskData.recurringFrequency,
          recurring_start_date_c: taskData.recurring_start_date_c || taskData.recurringStartDate,
          recurring_end_date_c: taskData.recurring_end_date_c || taskData.recurringEndDate,
          recurring_enabled_c: taskData.recurring_enabled_c !== undefined ? taskData.recurring_enabled_c : taskData.recurringEnabled,
          parent_task_id_c: taskData.parent_task_id_c !== undefined ? taskData.parent_task_id_c : taskData.parentTaskId,
          generated_description_c: taskData.generated_description_c || taskData.generatedDescription || null,
          subcategory_c: taskData.subcategory_c ? parseInt(taskData.subcategory_c) : null,
          urgency_c: taskData.urgency_c || taskData.urgency || null
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
          console.error(`Failed to update ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Task updated successfully");
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      toast.error("Failed to update task");
      return null;
    }
  }

  async delete(id) {
    try {
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
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success("Task deleted successfully");
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      toast.error("Failed to delete task");
      return false;
    }
  }

  // Additional methods for backward compatibility
  async getByCategory(categoryId) {
    try {
      const params = {
        fields: [
{"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "generated_description_c"}},
          {"field": {"Name": "subcategory_c"}},
          {"field": {"Name": "urgency_c"}},
          {"field": {"Name": "completed_c"}}
        ],
        where: [{"FieldName": "category_c", "Operator": "EqualTo", "Values": [parseInt(categoryId)]}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.error("Error fetching tasks by category:", error);
      return [];
    }
  }

  async getCompleted() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "completed_at_c"}}
        ],
        where: [{"FieldName": "completed_c", "Operator": "EqualTo", "Values": [true]}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      return [];
    }
  }

  async getPending() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "completed_c"}}
        ],
        where: [{"FieldName": "completed_c", "Operator": "EqualTo", "Values": [false]}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? (response.data || []) : [];
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      return [];
    }
  }
}

export const taskService = new TaskService()