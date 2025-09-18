import { Task, User } from '../models/Index.js';
import { Op } from 'sequelize';

class TaskController {
  
  /**
   * Get all tasks with filtering, pagination, and search
   * GET /api/tasks
   */
  static async getAllTasks(req, res) {
    try {
      const {
        status,
        priority,
        user_id,
        page = 1,
        limit = 10,
        sort = 'created_at',
        order = 'DESC',
        search
      } = req.query;

      // Build where clause
      const where = {};
      
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (user_id) where.user_id = user_id;
      
      // Add search functionality
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Calculate pagination
      const offset = (page - 1) * limit;

      // Get tasks with pagination
      const { count, rows: tasks } = await Task.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [[sort, order.toUpperCase()]],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }],
        distinct: true
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(count / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        data: {
          tasks,
          pagination: {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_items: count,
            items_per_page: parseInt(limit),
            has_next_page: hasNextPage,
            has_prev_page: hasPrevPage
          }
        },
        message: 'Tasks retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getAllTasks:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve tasks',
          details: error.message
        }
      });
    }
  }

  /**
   * Get single task by ID
   * GET /api/tasks/:id
   */
  static async getTaskById(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }]
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            details: `No task found with ID: ${id}`
          }
        });
      }

      res.status(200).json({
        success: true,
        data: { task },
        message: 'Task retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getTaskById:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve task',
          details: error.message
        }
      });
    }
  }

  /**
   * Create new task
   * POST /api/tasks
   */
  static async createTask(req, res) {
    try {
      const taskData = req.body;

      // Create task
      const task = await Task.create(taskData);

      // Fetch created task with associations
      const createdTask = await Task.findByPk(task.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }]
      });

      res.status(201).json({
        success: true,
        data: { task: createdTask },
        message: 'Task created successfully'
      });

    } catch (error) {
      console.error('Error in createTask:', error);
      
      // Handle validation errors
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors.map(err => ({
              field: err.path,
              message: err.message,
              value: err.value
            }))
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create task',
          details: error.message
        }
      });
    }
  }

  /**
   * Update task
   * PUT /api/tasks/:id
   */
  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if task exists
      const task = await Task.findByPk(id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            details: `No task found with ID: ${id}`
          }
        });
      }

      // Update task
      await task.update(updateData);

      // Fetch updated task with associations
      const updatedTask = await Task.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }]
      });

      res.status(200).json({
        success: true,
        data: { task: updatedTask },
        message: 'Task updated successfully'
      });

    } catch (error) {
      console.error('Error in updateTask:', error);
      
      // Handle validation errors
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors.map(err => ({
              field: err.path,
              message: err.message,
              value: err.value
            }))
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update task',
          details: error.message
        }
      });
    }
  }

  /**
   * Delete task
   * DELETE /api/tasks/:id
   */
  static async deleteTask(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByPk(id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            details: `No task found with ID: ${id}`
          }
        });
      }

      // Soft delete (paranoid: true in model)
      await task.destroy();

      res.status(200).json({
        success: true,
        data: null,
        message: 'Task deleted successfully'
      });

    } catch (error) {
      console.error('Error in deleteTask:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete task',
          details: error.message
        }
      });
    }
  }

  /**
   * Toggle task status (pending <-> completed)
   * PATCH /api/tasks/:id/toggle
   */
  static async toggleTaskStatus(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByPk(id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Task not found',
            details: `No task found with ID: ${id}`
          }
        });
      }

      // Toggle status using model method
      if (task.status === 'pending') {
        await task.markAsCompleted();
      } else {
        await task.markAsPending();
      }

      // Fetch updated task
      const updatedTask = await Task.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }]
      });

      res.status(200).json({
        success: true,
        data: { task: updatedTask },
        message: `Task marked as ${updatedTask.status}`
      });

    } catch (error) {
      console.error('Error in toggleTaskStatus:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to toggle task status',
          details: error.message
        }
      });
    }
  }

  /**
   * Get task statistics
   * GET /api/tasks/stats
   */
  static async getTaskStats(req, res) {
    try {
      const { user_id } = req.query;
      const where = user_id ? { user_id } : {};

      const [
        totalTasks,
        pendingTasks,
        completedTasks,
        highPriorityTasks,
        overdueTasks
      ] = await Promise.all([
        Task.count({ where }),
        Task.count({ where: { ...where, status: 'pending' } }),
        Task.count({ where: { ...where, status: 'completed' } }),
        Task.count({ where: { ...where, priority: 'high' } }),
        Task.count({
          where: {
            ...where,
            status: 'pending',
            due_date: {
              [Op.lt]: new Date()
            }
          }
        })
      ]);

      // Calculate completion rate
      const completionRate = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

      res.status(200).json({
        success: true,
        data: {
          statistics: {
            total_tasks: totalTasks,
            pending_tasks: pendingTasks,
            completed_tasks: completedTasks,
            high_priority_tasks: highPriorityTasks,
            overdue_tasks: overdueTasks,
            completion_rate: completionRate
          }
        },
        message: 'Task statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getTaskStats:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve task statistics',
          details: error.message
        }
      });
    }
  }

  /**
   * Bulk update tasks
   * PATCH /api/tasks/bulk
   */
  static async bulkUpdateTasks(req, res) {
    try {
      const { task_ids, update_data } = req.body;

      if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid request',
            details: 'task_ids array is required and cannot be empty'
          }
        });
      }

      if (!update_data || typeof update_data !== 'object') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid request',
            details: 'update_data object is required'
          }
        });
      }

      // Update tasks
      const [updatedCount] = await Task.update(update_data, {
        where: {
          id: {
            [Op.in]: task_ids
          }
        }
      });

      res.status(200).json({
        success: true,
        data: {
          updated_count: updatedCount,
          task_ids: task_ids
        },
        message: `${updatedCount} tasks updated successfully`
      });

    } catch (error) {
      console.error('Error in bulkUpdateTasks:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to bulk update tasks',
          details: error.message
        }
      });
    }
  }
}

module.exports = TaskController;