import mongoose from 'mongoose';

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

export default mongoose.model('User', userSchema);