import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const fixGoogleUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Finding Google OAuth users with password123...');
    
    // Find all Google OAuth users who have the default password
    const googleUsersWithPassword = await User.find({
      authProvider: 'google',
      googleId: { $exists: true },
      password: 'password123'
    });

    console.log(`📊 Found ${googleUsersWithPassword.length} Google OAuth users with default password`);

    if (googleUsersWithPassword.length > 0) {
      // Remove password field from Google OAuth users
      const result = await User.updateMany(
        {
          authProvider: 'google',
          googleId: { $exists: true },
          password: 'password123'
        },
        {
          $unset: { password: "" }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} Google OAuth users - removed password field`);
      
      // List updated users
      const updatedUsers = await User.find({
        authProvider: 'google',
        googleId: { $exists: true }
      }).select('email name authProvider password');
      
      console.log('📋 Updated Google OAuth users:');
      updatedUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) - Password: ${user.password ? 'SET' : 'NONE'}`);
      });
    } else {
      console.log('✅ No Google OAuth users found with default password');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

fixGoogleUsers();