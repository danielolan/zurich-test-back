const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = (sequelize) => {
  const UserModel = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Username cannot be empty'
        },
        len: {
          args: [3, 100],
          msg: 'Username must be between 3 and 100 characters'
        },
        isAlphanumeric: {
          msg: 'Username can only contain letters and numbers'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Email cannot be empty'
        },
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password cannot be empty'
        },
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'First name cannot exceed 100 characters'
        }
      }
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'Last name cannot exceed 100 characters'
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Soft deletes
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      },
      active: {
        where: { is_active: true }
      }
    }
  });

  // Instance methods
  UserModel.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  UserModel.prototype.getFullName = function() {
    return `${this.first_name || ''} ${this.last_name || ''}`.trim() || this.username;
  };

  UserModel.prototype.updateLastLogin = function() {
    this.last_login = new Date();
    return this.save();
  };

  // Class methods
  UserModel.findByCredentials = async function(username, password) {
    const user = await this.scope('withPassword').findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { username },
          { email: username }
        ],
        is_active: true
      }
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    return user;
  };

  // Associations
  UserModel.associate = (models) => {
    UserModel.hasMany(models.Task, {
      foreignKey: 'user_id',
      as: 'tasks'
    });
  };

  return UserModel;
};

module.exports = User;