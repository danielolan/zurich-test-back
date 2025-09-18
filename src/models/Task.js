const { DataTypes } = require('sequelize');

const Task = (sequelize) => {
  const TaskModel = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'Title must be between 1 and 255 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Description cannot exceed 1000 characters'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
      validate: {
        isIn: {
          args: [['pending', 'completed']],
          msg: 'Status must be either pending or completed'
        }
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Due date must be a valid date'
        },
        isAfter: {
          args: new Date().toISOString().split('T')[0],
          msg: 'Due date cannot be in the past'
        }
      }
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Permitir tareas sin usuario para simplicidad inicial
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    paranoid: true, // Soft deletes
    hooks: {
      beforeUpdate: (task) => {
        // Automatically set completed_at when status changes to completed
        if (task.status === 'completed' && !task.completed_at) {
          task.completed_at = new Date();
        } else if (task.status === 'pending') {
          task.completed_at = null;
        }
      }
    },
    scopes: {
      pending: {
        where: { status: 'pending' }
      },
      completed: {
        where: { status: 'completed' }
      },
      highPriority: {
        where: { priority: 'high' }
      },
      withUser: {
        include: ['User']
      }
    }
  });

  // Instance methods
  TaskModel.prototype.markAsCompleted = function() {
    this.status = 'completed';
    this.completed_at = new Date();
    return this.save();
  };

  TaskModel.prototype.markAsPending = function() {
    this.status = 'pending';
    this.completed_at = null;
    return this.save();
  };

  // Associations
  TaskModel.associate = (models) => {
    TaskModel.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return TaskModel;
};

module.exports = Task;