import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const migratePasswords = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔧 Adding password field to existing users...');
    
    // Update all users that don't have a password field
    const result = await User.updateMany(
      { password: { $exists: false } }, // Find users without password field
      { $set: { password: 'password123' } } // Set default password
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users with default password`);
    
    // Verify the update
    const users = await User.find({}, 'email password');
    console.log('\n📋 Current users with passwords:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.password ? '✅ Has password' : '❌ No password'}`);
    });
    
    console.log('\n🎉 Password migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

migratePasswords();