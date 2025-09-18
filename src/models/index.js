const { sequelize } = require('../config/database');
const TaskModel = require('./Task');
const UserModel = require('./User');

// Initialize models
const Task = TaskModel(sequelize);
const User = UserModel(sequelize);

// Store models in an object for easy access
const models = {
  Task,
  User,
  sequelize
};

// Execute associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;