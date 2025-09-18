const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must have at least 1 character',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  status: Joi.string()
    .valid('pending', 'completed')
    .default('pending')
    .messages({
      'any.only': 'Status must be either pending or completed'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium')
    .messages({
      'any.only': 'Priority must be low, medium, or high'
    }),
  
  due_date: Joi.date()
    .min('now')
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Due date must be a valid date',
      'date.min': 'Due date cannot be in the past'
    }),
  
  user_id: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'User ID must be a valid UUID'
    })
});

const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must have at least 1 character',
      'string.max': 'Title cannot exceed 255 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  status: Joi.string()
    .valid('pending', 'completed')
    .messages({
      'any.only': 'Status must be either pending or completed'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .messages({
      'any.only': 'Priority must be low, medium, or high'
    }),
  
  due_date: Joi.date()
    .min('now')
    .allow(null)
    .messages({
      'date.base': 'Due date must be a valid date',
      'date.min': 'Due date cannot be in the past'
    }),
  
  user_id: Joi.string()
    .uuid()
    .allow(null)
    .messages({
      'string.guid': 'User ID must be a valid UUID'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const taskQuerySchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'completed')
    .optional(),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional(),
  
  user_id: Joi.string()
    .uuid()
    .optional(),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional(),
  
  sort: Joi.string()
    .valid('title', 'status', 'priority', 'created_at', 'updated_at', 'due_date')
    .default('created_at')
    .optional(),
  
  order: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC')
    .optional(),
  
  search: Joi.string()
    .trim()
    .max(255)
    .optional()
});

const taskParamsSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Task ID must be a valid UUID',
      'any.required': 'Task ID is required'
    })
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskParamsSchema
};