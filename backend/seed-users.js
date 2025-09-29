import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Creating demo users...');
    
    const demoUsers = [
      {
        email: 'admin@company.com',
        name: 'System Administrator',
        phone: '+1-555-0001',
        role: 'administrator',
        isActive: true
      },
      {
        email: 'agent@company.com',
        name: 'Support Agent',
        phone: '+1-555-0002',
        role: 'support-agent',
        isActive: true
      },
      {
        email: 'customer@email.com',
        name: 'John Customer',
        phone: '+1-555-0003',
        role: 'customer',
        isActive: true
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    console.log('🎉 Demo users seeded successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedUsers();