const { Client } = require('pg');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const createDatabase = async () => {
  // Create connection to postgres (not to specific database)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    console.log('🔌 Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    const databaseName = process.env.DB_NAME || 'zurich_todo_db';

    // Check if database already exists
    const checkQuery = 'SELECT 1 FROM pg_database WHERE datname = $1';
    const result = await client.query(checkQuery, [databaseName]);

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      const createQuery = `CREATE DATABASE "${databaseName}"`;
      await client.query(createQuery);
      console.log(`✅ Database '${databaseName}' created successfully`);
    } else {
      console.log(`ℹ️  Database '${databaseName}' already exists`);
    }

  } catch (error) {
    if (error.code === '42P04') {
      console.log(`ℹ️  Database '${process.env.DB_NAME || 'zurich_todo_db'}' already exists`);
    } else {
      console.error('❌ Error creating database:', error.message);
      
      // More helpful error messages
      if (error.code === 'ECONNREFUSED') {
        console.error('💡 Make sure PostgreSQL is running. Try: brew services start postgresql');
      } else if (error.code === '28P01') {
        console.error('💡 Authentication failed. Check your DB_USER and DB_PASSWORD in .env');
      } else if (error.code === '3D000') {
        console.error('💡 Database does not exist. This script will create it.');
      }
      
      throw error;
    }
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  createDatabase()
    .then(() => {
      console.log('🎉 Database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = createDatabase;