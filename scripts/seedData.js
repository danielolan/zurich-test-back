const { Task, User, sequelize } = require('../src/models');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('Database models synchronized');

    // Create sample users (optional, for testing with authentication)
    const users = await User.bulkCreate([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith'
      },
      {
        username: 'admin_user',
        email: 'admin@zurich.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'User'
      }
    ], {
      ignoreDuplicates: true
    });

    console.log(`✅ Created ${users.length} users`);

    // Sample tasks data
    const tasksData = [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the Zurich Todo project including API endpoints and setup instructions.',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        user_id: users[0]?.id || null
      },
      {
        title: 'Review code changes',
        description: 'Review and approve pending pull requests from team members.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        user_id: users[0]?.id || null
      },
      {
        title: 'Setup development environment',
        description: 'Install and configure all necessary tools and dependencies for the project.',
        status: 'completed',
        priority: 'high',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completed_at: new Date(),
        user_id: users[1]?.id || null
      },
      {
        title: 'Design database schema',
        description: 'Create ERD and define database tables with proper relationships.',
        status: 'completed',
        priority: 'high',
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        user_id: users[1]?.id || null
      },
      {
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication system with login and registration endpoints.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        user_id: users[0]?.id || null
      },
      {
        title: 'Write unit tests',
        description: 'Create comprehensive test suite for all API endpoints and business logic.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        user_id: users[1]?.id || null
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment pipeline using GitHub Actions.',
        status: 'pending',
        priority: 'low',
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        user_id: users[0]?.id || null
      },
      {
        title: 'Update README file',
        description: 'Create detailed README with installation instructions, API documentation, and usage examples.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        user_id: users[1]?.id || null
      },
      {
        title: 'Optimize database queries',
        description: 'Review and optimize slow database queries for better performance.',
        status: 'pending',
        priority: 'low',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        user_id: users[0]?.id || null
      },
      {
        title: 'Add error logging',
        description: 'Implement comprehensive error logging and monitoring system.',
        status: 'completed',
        priority: 'medium',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        completed_at: new Date(),
        user_id: users[1]?.id || null
      },
      {
        title: 'Create API documentation',
        description: 'Generate Swagger/OpenAPI documentation for all API endpoints.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        user_id: users[0]?.id || null
      },
      {
        title: 'Security audit',
        description: 'Perform security review and implement necessary security measures.',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        user_id: users[1]?.id || null
      },
      {
        title: 'Fix responsive design issues',
        description: 'Resolve UI issues on mobile and tablet devices.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        user_id: users[2]?.id || null
      },
      {
        title: 'Implement caching strategy',
        description: 'Add Redis caching for frequently accessed data to improve performance.',
        status: 'pending',
        priority: 'low',
        due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        user_id: users[0]?.id || null
      },
      {
        title: 'User feedback analysis',
        description: 'Analyze user feedback from beta testing phase and prioritize improvements.',
        status: 'completed',
        priority: 'medium',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        user_id: users[2]?.id || null
      },
      {
        title: 'Prepare production deployment',
        description: 'Configure production environment, SSL certificates, and monitoring tools.',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        user_id: users[1]?.id || null
      },
      {
        title: 'Backup strategy implementation',
        description: 'Set up automated database backups and disaster recovery procedures.',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        user_id: users[2]?.id || null
      },
      {
        title: 'Performance testing',
        description: 'Conduct load testing and performance optimization for high traffic scenarios.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
        user_id: users[0]?.id || null
      },
      {
        title: 'Email notification system',
        description: 'Implement email notifications for task reminders and status updates.',
        status: 'pending',
        priority: 'low',
        due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        user_id: users[1]?.id || null
      },
      {
        title: 'Mobile app prototype',
        description: 'Create basic mobile app prototype using React Native.',
        status: 'pending',
        priority: 'low',
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        user_id: users[2]?.id || null
      },
      {
        title: 'Team training session',
        description: 'Conduct training session for the development team on new technologies used.',
        status: 'completed',
        priority: 'medium',
        due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        user_id: users[0]?.id || null
      },
      {
        title: 'Code quality improvement',
        description: 'Refactor legacy code and improve code quality metrics using SonarQube.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
        user_id: users[1]?.id || null
      },
      {
        title: 'Integration with third-party APIs',
        description: 'Integrate with external calendar and project management APIs.',
        status: 'pending',
        priority: 'low',
        due_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        user_id: users[2]?.id || null
      }
    ];

    // Create tasks
    const tasks = await Task.bulkCreate(tasksData, {
      ignoreDuplicates: true
    });

    console.log(`✅ Created ${tasks.length} tasks`);

    // Display summary
    const totalTasks = await Task.count();
    const pendingTasks = await Task.count({ where: { status: 'pending' } });
    const completedTasks = await Task.count({ where: { status: 'completed' } });
    const highPriorityTasks = await Task.count({ where: { priority: 'high' } });
    const mediumPriorityTasks = await Task.count({ where: { priority: 'medium' } });
    const lowPriorityTasks = await Task.count({ where: { priority: 'low' } });
    const totalUsers = await User.count();

    console.log('\n' + '='.repeat(50));
    console.log('📊 DATABASE SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`👥 Total Users Created: ${totalUsers}`);
    console.log(`📝 Total Tasks Created: ${totalTasks}`);
    console.log('');
    console.log('📋 Tasks by Status:');
    console.log(`   ⏳ Pending: ${pendingTasks}`);
    console.log(`   ✅ Completed: ${completedTasks}`);
    console.log('');
    console.log('🎯 Tasks by Priority:');
    console.log(`   🔴 High: ${highPriorityTasks}`);
    console.log(`   🟡 Medium: ${mediumPriorityTasks}`);
    console.log(`   🟢 Low: ${lowPriorityTasks}`);
    console.log('');
    console.log('👤 Sample Users Created:');
    for (const user of users) {
      const userTaskCount = await Task.count({ where: { user_id: user.id } });
      console.log(`   • ${user.username} (${user.email}) - ${userTaskCount} tasks`);
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Database seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = seedData;