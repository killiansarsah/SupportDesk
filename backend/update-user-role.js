import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const updateUserRole = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userEmail = 'markselly19@gmail.com';
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ User not found: ${userEmail}`);
      console.log('📋 Available users in database:');
      const allUsers = await User.find({}).select('email name role');
      allUsers.forEach(u => console.log(`   - ${u.email} (${u.name}) - Role: ${u.role}`));
    } else {
      console.log(`👤 Found user: ${user.name} (${user.email})`);
      console.log(`📊 Current role: ${user.role}`);
      
      // Update user role to support-agent
      user.role = 'support-agent';
      await user.save();
      
      console.log(`✅ Successfully updated ${user.name} to support-agent role`);
      console.log(`📧 User: ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🎭 New Role: ${user.role}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

updateUserRole();