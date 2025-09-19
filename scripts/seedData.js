const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const createTablesAndSeedData = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'zurich_todo_db'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create ENUM types first
    console.log('📝 Creating ENUM types...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE task_status AS ENUM ('pending', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    console.log('👥 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    // Create tasks table
    console.log('📋 Creating tasks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status task_status DEFAULT 'pending',
        priority task_priority DEFAULT 'medium',
        due_date TIMESTAMP,
        completed_at TIMESTAMP,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    console.log('✅ Tables created successfully');

    // Insert sample users
    console.log('👤 Inserting sample users...');
    const usersResult = await client.query(`
      INSERT INTO users (username, email, password, first_name, last_name)
      VALUES 
        ('john_doe', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj83fB.l3WSK', 'John', 'Doe'),
        ('jane_smith', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj83fB.l3WSK', 'Jane', 'Smith'),
        ('admin_user', 'admin@zurich.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj83fB.l3WSK', 'Admin', 'User')
      ON CONFLICT (username) DO NOTHING
      RETURNING id;
    `);

    // Get user IDs
    const userIds = await client.query('SELECT id FROM users ORDER BY created_at LIMIT 3');
    const [user1, user2, user3] = userIds.rows.map(row => row.id);

    // Insert sample tasks
    console.log('📝 Inserting sample tasks...');
    await client.query(`
      INSERT INTO tasks (title, description, status, priority, due_date, user_id, completed_at)
      VALUES 
        ('Complete project documentation', 'Write comprehensive documentation for the Zurich Todo project', 'pending', 'high', NOW() + INTERVAL '7 days', $1, NULL),
        ('Review code changes', 'Review and approve pending pull requests from team members', 'pending', 'medium', NOW() + INTERVAL '3 days', $1, NULL),
        ('Setup development environment', 'Install and configure all necessary tools and dependencies', 'completed', 'high', NOW() - INTERVAL '2 days', $2, NOW()),
        ('Design database schema', 'Create ERD and define database tables with proper relationships', 'completed', 'high', NOW() - INTERVAL '5 days', $2, NOW() - INTERVAL '4 days'),
        ('Implement user authentication', 'Add JWT-based authentication system with login and registration', 'pending', 'medium', NOW() + INTERVAL '10 days', $1, NULL),
        ('Write unit tests', 'Create comprehensive test suite for all API endpoints', 'pending', 'medium', NOW() + INTERVAL '14 days', $2, NULL),
        ('Setup CI/CD pipeline', 'Configure automated testing and deployment pipeline', 'pending', 'low', NOW() + INTERVAL '21 days', $1, NULL),
        ('Update README file', 'Create detailed README with installation instructions', 'pending', 'medium', NOW() + INTERVAL '5 days', $2, NULL),
        ('Optimize database queries', 'Review and optimize slow database queries for better performance', 'pending', 'low', NOW() + INTERVAL '30 days', $1, NULL),
        ('Add error logging', 'Implement comprehensive error logging and monitoring system', 'completed', 'medium', NOW() - INTERVAL '1 day', $2, NOW()),
        ('Create API documentation', 'Generate Swagger/OpenAPI documentation for all endpoints', 'pending', 'medium', NOW() + INTERVAL '12 days', $1, NULL),
        ('Security audit', 'Perform security review and implement necessary security measures', 'pending', 'high', NOW() + INTERVAL '18 days', $2, NULL),
        ('Fix responsive design issues', 'Resolve UI issues on mobile and tablet devices', 'pending', 'medium', NOW() + INTERVAL '8 days', $3, NULL),
        ('Implement caching strategy', 'Add Redis caching for frequently accessed data', 'pending', 'low', NOW() + INTERVAL '25 days', $1, NULL),
        ('User feedback analysis', 'Analyze user feedback from beta testing phase', 'completed', 'medium', NOW() - INTERVAL '3 days', $3, NOW() - INTERVAL '1 day')
      ON CONFLICT DO NOTHING;
    `, [user1, user2, user3]);

    // Get statistics
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM tasks) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'pending') as pending_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM tasks WHERE priority = 'high') as high_priority,
        (SELECT COUNT(*) FROM tasks WHERE priority = 'medium') as medium_priority,
        (SELECT COUNT(*) FROM tasks WHERE priority = 'low') as low_priority;
    `);

    const summary = stats.rows[0];

    console.log('\n' + '='.repeat(50));
    console.log('📊 DATABASE SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`👥 Total Users: ${summary.total_users}`);
    console.log(`📝 Total Tasks: ${summary.total_tasks}`);
    console.log('');
    console.log('📋 Tasks by Status:');
    console.log(`   ⏳ Pending: ${summary.pending_tasks}`);
    console.log(`   ✅ Completed: ${summary.completed_tasks}`);
    console.log('');
    console.log('🎯 Tasks by Priority:');
    console.log(`   🔴 High: ${summary.high_priority}`);
    console.log(`   🟡 Medium: ${summary.medium_priority}`);
    console.log(`   🟢 Low: ${summary.low_priority}`);
    console.log('='.repeat(50));
    console.log('✅ Database seeded successfully!');
    console.log('🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

if (require.main === module) {
  createTablesAndSeedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = createTablesAndSeedData;