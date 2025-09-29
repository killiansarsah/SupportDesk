import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  phone: String,
  role: String,
  avatar: String,
  isActive: Boolean,
  lastLogin: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function hashExistingPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to process`);

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      if (!user.password.startsWith('$2')) {
        console.log(`🔐 Hashing password for: ${user.email}`);
        user.password = await bcrypt.hash(user.password, 12);
        await User.updateOne({ _id: user._id }, { password: user.password });
        console.log(`✅ Updated password for: ${user.email}`);
      } else {
        console.log(`⏭️  Password already hashed for: ${user.email}`);
      }
    }

    console.log('🎉 Password migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

hashExistingPasswords();