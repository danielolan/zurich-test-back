const express = require('express');
const taskRoutes = require('./tasks');

const router = express.Router();

// API Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Info
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Zurich Todo API',
      version: '1.0.0',
      description: 'RESTful API for managing tasks',
      endpoints: {
        tasks: '/api/tasks',
        health: '/api/health',
        info: '/api/info'
      },
      documentation: {
        tasks: {
          'GET /api/tasks': 'Get all tasks with filtering and pagination',
          'POST /api/tasks': 'Create new task',
          'GET /api/tasks/:id': 'Get task by ID',
          'PUT /api/tasks/:id': 'Update task',
          'DELETE /api/tasks/:id': 'Delete task',
          'PATCH /api/tasks/:id/toggle': 'Toggle task status',
          'GET /api/tasks/stats': 'Get task statistics',
          'PATCH /api/tasks/bulk': 'Bulk update tasks'
        }
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/tasks', taskRoutes);

module.exports = router;