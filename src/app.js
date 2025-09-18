const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, sequelize } = require('./config/database');
const config = require('./config/config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    config.corsOrigin,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      type: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Zurich Todo API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      tasks: '/api/tasks'
    },
    documentation: 'Visit /api/info for detailed API documentation',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', routes);

// Handle 404 errors
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    } else {
      await sequelize.sync();
    }

    // Start server
    const server = app.listen(config.port, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 API URL: http://localhost:${config.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api/info`);
      console.log(`❤️  Health Check: http://localhost:${config.port}/api/health`);
      console.log('='.repeat(50) + '\n');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        
        try {
          await sequelize.close();
          console.log('Database connection closed.');
        } catch (error) {
          console.error('Error closing database connection:', error);
        }
        
        console.log('Graceful shutdown completed.');
        process.exit(0);
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.error('Unhandled Promise Rejection:', err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;