require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'zurich_todo_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT || 'postgres',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },
  
  // CORS
  corsOrigin: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

module.exports = config;