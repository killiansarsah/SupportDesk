import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userData = {
      email: 'killiansarsah@gmail.com',
      password: 'killiansarsah@gmail.com123',
      name: 'Killian Sarsah',
      role: 'administrator'
    };

    console.log(`🔍 Checking if user already exists: ${userData.email}`);
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      console.log(`👤 User already exists: ${existingUser.name} (${existingUser.email})`);
      // Update role/password if needed
      existingUser.role = userData.role;
      // Only set password if different
      existingUser.password = userData.password;
      existingUser.isActive = true;
      existingUser.emailVerified = true;
      await existingUser.save();
      console.log(`✅ Updated existing user to administrator and updated password.`);
    } else {
      console.log('🆕 Creating new administrator user...');
      const newUser = new User({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: '+1-555-0000',
        role: userData.role,
        isActive: true,
        lastLogin: new Date(),
        authProvider: 'email',
        emailVerified: true
      });

      await newUser.save();
      console.log(`✅ Successfully created administrator: ${newUser.name}`);
      console.log(`📧 Email: ${newUser.email}`);
      console.log('🔒 Password: Set (hashed)');
    }

    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}).select('email name role authProvider');
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - Role: ${u.role} - Auth: ${u.authProvider || 'local'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdmin();
