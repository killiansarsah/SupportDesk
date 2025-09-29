import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: 'password123' },
  name: { type: String, required: true },
  phone: { 
    type: String, 
    required: function() {
      return this.isNew; // Only required for new users
    },
    default: '+1-555-0000'
  },
  role: { 
    type: String, 
    enum: ['administrator', 'support-agent', 'customer'], 
    required: true 
  },
  avatar: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);