const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Función para conectar a la BD
const connectDB = () => {
  return new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'zurich_todo_db'
  });
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Zurich Todo API',
    version: '1.0.0',
    endpoints: {
      'GET /api/tasks': 'Get all tasks',
      'POST /api/tasks': 'Create new task',
      'PUT /api/tasks/:id': 'Update task',
      'DELETE /api/tasks/:id': 'Delete task',
      'GET /api/tasks/stats': 'Get statistics'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  const client = connectDB();
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        t.*,
        u.username,
        u.first_name,
        u.last_name
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.deleted_at IS NULL
      ORDER BY t.created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      data: {
        tasks: result.rows,
        total: result.rows.length
      },
      message: 'Tasks retrieved successfully from database'
    });
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve tasks',
        details: error.message
      }
    });
  } finally {
    await client.end();
  }
});

// Get task by ID
app.get('/api/tasks/:id', async (req, res) => {
  const client = connectDB();
  const { id } = req.params;
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        t.*,
        u.username,
        u.first_name,
        u.last_name
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = $1 AND t.deleted_at IS NULL
    `, [id]);
    
    if (result.rows.length === 0) {
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
      data: {
        task: result.rows[0]
      },
      message: 'Task retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve task',
        details: error.message
      }
    });
  } finally {
    await client.end();
  }
});

// Get task stats
app.get('/api/tasks/stats', async (req, res) => {
  const client = connectDB();
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks
      FROM tasks 
      WHERE deleted_at IS NULL
    `);
    
    res.status(200).json({
      success: true,
      data: {
        statistics: result.rows[0]
      },
      message: 'Statistics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve statistics',
        details: error.message
      }
    });
  } finally {
    await client.end();
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  const client = connectDB();
  const { title, description, status = 'pending', priority = 'medium', due_date, user_id } = req.body;
  
  if (!title) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: 'Title is required'
      }
    });
  }
  
  try {
    await client.connect();
    
    const result = await client.query(`
      INSERT INTO tasks (title, description, status, priority, due_date, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, status, priority, due_date, user_id]);
    
    res.status(201).json({
      success: true,
      data: {
        task: result.rows[0]
      },
      message: 'Task created successfully'
    });
    
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create task',
        details: error.message
      }
    });
  } finally {
    await client.end();
  }
});

// Update task by ID
app.put('/api/tasks/:id', async (req, res) => {
  const client = connectDB();
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;
  
  try {
    await client.connect();
    
    // Verificar que la tarea existe
    const checkResult = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task not found',
          details: `No task found with ID: ${id}`
        }
      });
    }
    
    // Construir query dinámico para actualizar solo los campos enviados
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
      
      // Si se marca como completada, agregar completed_at
      if (status === 'completed') {
        updateFields.push(`completed_at = NOW()`);
      } else if (status === 'pending') {
        updateFields.push(`completed_at = NULL`);
      }
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount++}`);
      values.push(due_date);
    }
    
    updateFields.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    
    res.status(200).json({
      success: true,
      data: {
        task: result.rows[0]
      },
      message: 'Task updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update task',
        details: error.message
      }
    });
  } finally {
    await client.end();
  }
});

// Delete task by ID
app.delete('/api/tasks/:id', async (req, res) => {
  const client = connectDB();
  const { id } = req.params;
  
  try {
    await client.connect();
    
    // Verificar que la tarea existe
    const checkResult = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task not found',
          details: `No task found with ID: ${id}`
        }
      });
    }
    
    // Soft delete (marcar como eliminado)
    await client.query(
      'UPDATE tasks SET deleted_at = NOW() WHERE id = $1',
      [id]
    );
    
    res.status(200).json({
      success: true,
      data: null,
      message: 'Task deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete task',
        details: error.message
      }
    });
  } finally {
    await client.end();
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/api/tasks`);
  console.log(`   POST   http://localhost:${PORT}/api/tasks`);
  console.log(`   PUT    http://localhost:${PORT}/api/tasks/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/tasks/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/tasks/stats`);
});

module.exports = app;