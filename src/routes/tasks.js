const express = require('express');
const TaskController = require('../controllers/taskController');
const { validate, validateMultiple, sanitizeInput } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskParamsSchema
} = require('../validators/taskValidators');

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Public
 */
router.get('/stats', 
  validate(taskQuerySchema, 'query'),
  asyncHandler(TaskController.getTaskStats)
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filtering, pagination, and search
 * @access  Public
 * @query   ?status=pending&priority=high&page=1&limit=10&search=title&sort=created_at&order=DESC
 */
router.get('/',
  validate(taskQuerySchema, 'query'),
  asyncHandler(TaskController.getAllTasks)
);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Public
 * @body    { title, description?, status?, priority?, due_date?, user_id? }
 */
router.post('/',
  validate(createTaskSchema, 'body'),
  asyncHandler(TaskController.createTask)
);

/**
 * @route   PATCH /api/tasks/bulk
 * @desc    Bulk update tasks
 * @access  Public
 * @body    { task_ids: [], update_data: {} }
 */
router.patch('/bulk', asyncHandler(TaskController.bulkUpdateTasks));

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Public
 */
router.get('/:id',
  validate(taskParamsSchema, 'params'),
  asyncHandler(TaskController.getTaskById)
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Public
 * @body    { title?, description?, status?, priority?, due_date?, user_id? }
 */
router.put('/:id',
  validateMultiple({
    params: taskParamsSchema,
    body: updateTaskSchema
  }),
  asyncHandler(TaskController.updateTask)
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Public
 */
router.delete('/:id',
  validate(taskParamsSchema, 'params'),
  asyncHandler(TaskController.deleteTask)
);

/**
 * @route   PATCH /api/tasks/:id/toggle
 * @desc    Toggle task status (pending <-> completed)
 * @access  Public
 */
router.patch('/:id/toggle',
  validate(taskParamsSchema, 'params'),
  asyncHandler(TaskController.toggleTaskStatus)
);

module.exports = router;