const fs = require('fs');
const path = require('path');
const createDatabase = require('./createDatabase');

const setupProject = async () => {
  console.log('🚀 Starting Zurich Todo Backend Setup...\n');

  try {
    // Step 1: Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');

    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env file from .env.example...');
      
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created successfully');
        console.log('⚠️  Please update the .env file with your database credentials\n');
      } else {
        console.log('❌ .env.example not found. Creating basic .env file...');
        
        // Create basic .env file
        const basicEnv = `# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zurich_todo_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`;

        fs.writeFileSync(envPath, basicEnv);
        console.log('✅ Basic .env file created');
        console.log('⚠️  Please update the .env file with your database credentials\n');
      }
    } else {
      console.log('✅ .env file already exists\n');
    }

    // Load environment variables
    require('dotenv').config({ path: envPath });

    // Step 2: Check database credentials
    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'your_password_here') {
      console.log('⚠️  Warning: Please set your database password in the .env file');
      console.log('   Update DB_PASSWORD in .env file with your PostgreSQL password\n');
    }

    // Step 3: Create database
    console.log('🗄️  Setting up database...');
    await createDatabase();
    console.log('✅ Database setup completed\n');

    // Step 4: Ask about seeding (simple version without requiring models)
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const seedAnswer = await new Promise((resolve) => {
      rl.question('Would you like to install dependencies and start the server? (y/N): ', (answer) => {
        resolve(answer.toLowerCase());
      });
    });

    rl.close();

    if (seedAnswer === 'y' || seedAnswer === 'yes') {
      console.log('📦 Next step: Install dependencies with: npm install');
      console.log('🚀 Then start the server with: npm run dev');
      console.log('🌱 The server will automatically create tables and you can seed data later\n');
    }

    // Step 5: Display completion message
    console.log('='.repeat(60));
    console.log('🎉 BASIC SETUP COMPLETED!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. ✅ Database created');
    console.log('2. ✅ .env file configured');
    console.log('3. 📦 Run: npm install');
    console.log('4. 🚀 Run: npm run dev');
    console.log('5. 🌱 Run: npm run db:seed (optional - for sample data)');
    console.log('6. 🧪 Test: http://localhost:3001/api/health');
    console.log('');
    console.log('📚 Available Scripts:');
    console.log('- npm start          Start production server');
    console.log('- npm run dev        Start development server with nodemon');
    console.log('- npm run db:seed    Seed database with sample data');
    console.log('- npm test           Run tests');
    console.log('');
    console.log('📖 API Documentation: http://localhost:3001/api/info');
    console.log('❤️  Health Check: http://localhost:3001/api/health');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure PostgreSQL is running: brew services start postgresql');
    console.error('2. Check your database credentials in .env');
    console.error('3. Ensure the database user has proper permissions');
    console.error('4. Try: psql postgres -c "ALTER USER postgres PASSWORD \'yourpassword\';"');
    process.exit(1);
  }
};

// Run setup if called directly
if (require.main === module) {
  setupProject();
}

module.exports = setupProject;