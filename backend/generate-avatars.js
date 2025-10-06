/**
 * Generate and assign avatars to all existing users in the database
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import mongoose from 'mongoose';
import User from './models/User.js';
import { getUserAvatar } from './utils/avatarGenerator.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://killiansarsah:KillianSarsah@cluster0.iuo8l.mongodb.net/support-ticket?retryWrites=true&w=majority&appName=Cluster0';

async function generateAvatarsForAllUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users in database\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Skip if user already has a custom avatar (not default)
      if (user.avatar && !user.avatar.includes('ui-avatars.com') && !user.avatar.includes('dicebear.com')) {
        console.log(`⏭️  Skipping ${user.name} (${user.email}) - already has custom avatar`);
        skippedCount++;
        continue;
      }

      // Generate new avatar
      const avatarUrl = getUserAvatar(user);
      user.avatar = avatarUrl;
      await user.save();

      console.log(`✨ Generated avatar for ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Avatar: ${avatarUrl.substring(0, 80)}...`);
      console.log('');
      
      updatedCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updatedCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users`);
    console.log(`   📝 Total: ${users.length} users`);
    
    console.log('\n✨ Avatar generation complete!');

  } catch (error) {
    console.error('❌ Error generating avatars:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
generateAvatarsForAllUsers();
