import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function removeDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const demoEmails = [
      'admin@company.com',
      'agent@company.com', 
      'customer@email.com'
    ];

    for (const email of demoEmails) {
      const result = await User.deleteOne({ email });
      if (result.deletedCount > 0) {
        console.log(`🗑️  Removed demo user: ${email}`);
      } else {
        console.log(`⚠️  Demo user not found: ${email}`);
      }
    }

    console.log('🎉 Demo users removal completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing demo users:', error.message);
    process.exit(1);
  }
}

removeDemoUsers();