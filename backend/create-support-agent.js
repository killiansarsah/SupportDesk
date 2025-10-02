import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const createSupportAgent = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userData = {
      email: 'markselly19@gmail.com',
      password: 'Selly@22',
      name: 'Mark Selly',
      role: 'support-agent'
    };

    console.log(`🔍 Checking if user already exists: ${userData.email}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    
    if (existingUser) {
      console.log(`👤 User already exists: ${existingUser.name} (${existingUser.email})`);
      console.log(`📊 Current role: ${existingUser.role}`);
      
      // Update existing user to support-agent
      existingUser.role = 'support-agent';
      await existingUser.save();
      
      console.log(`✅ Successfully updated ${existingUser.name} to support-agent role`);
    } else {
      console.log('🆕 Creating new support agent user...');
      
      // Create new user
      const newUser = new User({
        email: userData.email,
        password: userData.password, // Will be hashed by pre-save middleware
        name: userData.name,
        phone: '+1-555-0000',
        role: userData.role,
        isActive: true,
        lastLogin: new Date(),
        authProvider: 'email',
        emailVerified: true
      });

      await newUser.save();
      
      console.log(`✅ Successfully created new support agent: ${newUser.name}`);
      console.log(`📧 Email: ${newUser.email}`);
      console.log(`🎭 Role: ${newUser.role}`);
      console.log(`🔒 Password: Set (hashed)`);
    }

    // Show updated user list
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}).select('email name role authProvider');
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - Role: ${u.role} - Auth: ${u.authProvider || 'local'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createSupportAgent();