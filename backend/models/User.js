import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() {
      // Password not required for OAuth users
      return !this.googleId && !this.authProvider;
    }
    // No default password - OAuth users shouldn't have passwords
  },
  name: { type: String, required: true },
  phone: { 
    type: String, 
    required: function() {
      return this.isNew && !this.googleId; // Not required for Google OAuth users
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
  lastLogin: Date,
  
  // Google OAuth specific fields
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true // Allows multiple null values
  },
  
  // Authentication provider tracking
  authProvider: { 
    type: String, 
    enum: ['email', 'google'], 
    default: 'email' 
  },
  
  // Email verification status (useful for OAuth)
  emailVerified: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Hash password before saving (skip for OAuth users without password)
userSchema.pre('save', async function(next) {
  // Skip password hashing if no password is set (OAuth users)
  if (!this.password || !this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Return false if no password is set (OAuth users)
  if (!this.password) return false;
  
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user can authenticate with Google
userSchema.methods.canAuthenticateWithGoogle = function() {
  return !!this.googleId;
};

// Check if user has multiple authentication methods
userSchema.methods.hasMultipleAuthMethods = function() {
  return !!(this.password && this.googleId);
};

export default mongoose.model('User', userSchema);