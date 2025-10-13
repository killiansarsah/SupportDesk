import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import Template from './models/Template.js';
import emailService from './emailService.js';
import TicketIdGenerator from './utils/ticketIdGenerator.js';
import { getUserAvatar } from './utils/avatarGenerator.js';

const app = express();
const PORT = process.env.PORT || 3002;
console.log('🔧 Backend env check:', {
  cwd: process.cwd(),
  envFileExists: true,
  googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.slice(0, 20) || 'undefined'
});

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  // Production frontend domains
  'https://singular-brigadeiros-f7651e.netlify.app',
  'https://support-ticket-sigma.vercel.app',
  'https://supportdesk-frontend.vercel.app',
  'https://supportdesk-frontend.netlify.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGINS?.split(',')
].flat().filter(Boolean); // Flatten array and remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔧 Please check your MongoDB URI and network connection');
    process.exit(1);
  }
};

connectDB();



// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    
    // Check password using bcrypt
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    
    // Update last login without triggering validation
    await User.updateOne(
      { _id: user._id }, 
      { lastLogin: new Date() },
      { runValidators: false }
    );
    
    console.log('✅ Login successful for:', user.name);
    res.json({ success: true, user, token: `mock_token_${user._id}` });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, phone, role, password } = req.body;
    
    console.log('📝 Registration attempt for:', email);
    
    if (!email || !name || !phone || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required: email, name, phone, role' 
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    const user = new User({
      email,
      name,
      phone,
      role,
      password: password || 'password123',
      isActive: true,
      lastLogin: new Date()
    });
    
    await user.save();
    
    // Generate and assign avatar after user is saved (so we have the _id)
    user.avatar = getUserAvatar(user);
    await user.save();
    
    console.log('✅ Registration successful for:', user.name);
    res.json({ success: true, user, token: `mock_token_${user._id}` });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google OAuth Routes
import GoogleOAuthHandler from './services/googleOAuthHandler.js';
const googleAuth = new GoogleOAuthHandler();

// Debug: Check Google OAuth configuration
console.log('🔧 Google Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
console.log('🔧 Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Missing');

/**
 * Google OAuth Sign-In Route
 * Handles authentication with Google ID token
 * 
 * Security Features:
 * - Server-side token verification
 * - CSRF protection
 * - Rate limiting ready
 */
app.post('/api/auth/google/signin', async (req, res) => {
  try {
    const { credential, csrfToken } = req.body;
    
    console.log('🔐 Google sign-in attempt');
    
    // Validate required fields
    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google credential is required' 
      });
    }

    // Process Google authentication
    const result = await googleAuth.handleGoogleSignIn(credential, csrfToken);
    
    if (result.success) {
      console.log('✅ Google sign-in successful for:', result.user.email);
      res.json(result);
    } else {
      console.log('❌ Google sign-in failed:', result.error);
      res.status(401).json(result);
    }

  } catch (error) {
    console.error('❌ Google sign-in error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during Google authentication' 
    });
  }
});

/**
 * Google OAuth Sign-Up Route
 * Handles new user registration with Google account
 * 
 * Note: For OAuth, sign-up and sign-in are typically the same process
 */
app.post('/api/auth/google/signup', async (req, res) => {
  try {
    const { credential, csrfToken } = req.body;
    
    console.log('📝 Google sign-up attempt');
    
    // Validate required fields
    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google credential is required' 
      });
    }

    // Process Google registration (same as sign-in for OAuth)
    const result = await googleAuth.handleGoogleSignUp(credential, csrfToken);
    
    if (result.success) {
      console.log('✅ Google sign-up successful for:', result.user.email);
      res.json(result);
    } else {
      console.log('❌ Google sign-up failed:', result.error);
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Google sign-up error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during Google registration' 
    });
  }
});

/**
 * CSRF Token Generation Route
 * Provides CSRF tokens for secure OAuth flows
 */
app.get('/api/auth/csrf-token', (req, res) => {
  try {
    const csrfToken = googleAuth.generateCSRFToken();
    
    // Store token in session (if using sessions) or return for client storage
    res.json({ 
      success: true, 
      csrfToken: csrfToken 
    });

  } catch (error) {
    console.error('❌ CSRF token generation error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate CSRF token' 
    });
  }
});

/**
 * Google Account Unlink Route
 * Allows users to unlink their Google account
 */
app.post('/api/auth/google/unlink', async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log('🔗 Google account unlink request for user:', userId);
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    const success = await googleAuth.unlinkGoogleAccount(userId);
    
    if (success) {
      console.log('✅ Google account unlinked successfully');
      res.json({ 
        success: true, 
        message: 'Google account unlinked successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to unlink Google account' 
      });
    }

  } catch (error) {
    console.error('❌ Google unlink error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during account unlinking' 
    });
  }
});
// End of Google OAuth routes

// User Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple admin verification middleware
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7);

    if (!token) {
      console.log('❌ verifyAdmin - No token provided');
      return res.status(401).json({ success: false, error: 'Unauthorized - No token provided' });
    }

    let userId;

    // Handle mock token format: mock_token_<userId> (from email/password login)
    if (token.startsWith('mock_token_')) {
      userId = token.replace('mock_token_', '');
      console.log('✅ verifyAdmin - Using mock token, userId:', userId);
    } 
    // Handle JWT token format (from Google OAuth login)
    else if (token.includes('.')) {
      try {
        const jwt = await import('jsonwebtoken');
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production';
        const decoded = jwt.default.verify(token, jwtSecret);
        userId = decoded.userId;
        console.log('✅ verifyAdmin - JWT verified, userId:', userId);
      } catch (jwtError) {
        console.error('❌ JWT verification error:', jwtError.message);
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }
    } 
    else {
      console.log('❌ verifyAdmin - Invalid token format');
      return res.status(401).json({ success: false, error: 'Invalid token format' });
    }

    if (!userId) {
      console.log('❌ verifyAdmin - No userId extracted');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ verifyAdmin - User not found:', userId);
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (user.role !== 'administrator') {
      console.log('❌ verifyAdmin - User is not admin:', user.email, user.role);
      return res.status(403).json({ success: false, error: 'Forbidden - admin only' });
    }

    console.log('✅ verifyAdmin - Admin verified:', user.email);
    // attach to request for downstream use
    req.adminUser = user;
    next();
  } catch (err) {
    console.error('❌ Admin verification error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Server error during admin verification' });
  }
};

/**
 * Admin create user
 * Protected route for administrators to create users with any role
 */
app.post('/api/users', verifyAdmin, async (req, res) => {
  try {
    const { email, name, phone, role, password } = req.body;
    if (!email || !name || !role) {
      return res.status(400).json({ success: false, error: 'Required fields: email, name, role' });
    }

    const allowedRoles = ['administrator', 'support-agent', 'customer'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, error: 'User already exists' });

    const user = new User({
      email,
      name,
      phone: phone || '+1-555-0000',
      role,
      password: password || Math.random().toString(36).slice(-8),
      isActive: true,
      emailVerified: true,
      authProvider: 'email',
      lastLogin: new Date()
    });

    await user.save();
    
    // Generate and assign avatar
    user.avatar = getUserAvatar(user);
    await user.save();

    res.json({ success: true, user: { id: user._id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
  } catch (error) {
    console.error('Create user error:', error.message || error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Admin delete user
 * Protected route for administrators to delete users
 */
app.delete('/api/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.adminUser._id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    
    console.log(`✅ Admin ${req.adminUser.email} deleted user: ${user.email} (${user.role})`);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message || error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ticket Routes
app.get('/api/tickets', async (req, res) => {
  try {
    const { userId, userRole, status, priority, category, search } = req.query;
    
    let query = {};
    
    if (userRole === 'customer' && userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        const userMap = {
          '1': 'admin@company.com',
          '2': 'agent@company.com', 
          '3': 'customer@email.com'
        };
        const email = userMap[userId];
        if (email) {
          const user = await User.findOne({ email });
          if (user) query.customerId = user._id;
        }
      } else {
        query.customerId = userId;
      }
    }
    
    if (status) query.status = { $in: status.split(',') };
    if (priority) query.priority = { $in: priority.split(',') };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tickets = await Ticket.find(query)
      .populate('customerId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });
    
    const transformedTickets = tickets.map(ticket => {
      const ticketObj = ticket.toObject();
      return {
        _id: ticket._id,
        id: ticket.ticketNumber || ticket._id.toString(), // Use ticketNumber if available, fallback to _id
        ticketNumber: ticket.ticketNumber,
        ...ticketObj,
        assignedTo: ticketObj.assignedTo ? ticketObj.assignedTo._id.toString() : null,
        messages: ticketObj.messages || [],
        attachments: ticketObj.attachments || [],
        history: ticketObj.history || []
      };
    });
    
    res.json(transformedTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    let customerId = req.body.customerId;
    
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      const userMap = {
        '1': 'admin@company.com',
        '2': 'agent@company.com', 
        '3': 'customer@email.com'
      };
      
      const email = userMap[customerId];
      if (email) {
        const user = await User.findOne({ email });
        if (user) {
          customerId = user._id;
        } else {
          return res.status(400).json({ error: 'User not found' });
        }
      } else {
        return res.status(400).json({ error: 'Invalid customerId' });
      }
    }

    // Generate a short, readable ticket number
    const ticketNumber = await TicketIdGenerator.generateShortId(Ticket);
    console.log('🎫 Generated ticket number:', ticketNumber);

    const ticket = new Ticket({
      ticketNumber,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      customerId,
      language: req.body.language || 'en'
    });
    
    console.log('💾 Attempting to save ticket to database...');
    const savedTicket = await ticket.save();
    console.log('✅ Ticket saved successfully! ID:', savedTicket._id, 'Number:', savedTicket.ticketNumber);
    
    await ticket.populate('customerId', 'name email');
    
    // Verify ticket was actually saved by querying it back
    const verifyTicket = await Ticket.findById(savedTicket._id);
    if (verifyTicket) {
      console.log('✅ Ticket verification successful - found in database');
    } else {
      console.error('❌ WARNING: Ticket not found in database after save!');
    }
    
    // Send email notifications
    try {
      // Get all support agents and administrators
      const supportStaff = await User.find({
        role: { $in: ['support-agent', 'administrator'] },
        email: { $exists: true, $ne: '' }
      }).select('name email role');

      // Prepare ticket data for email
      const ticketData = {
        id: ticket.ticketNumber, // Use short ticket number instead of MongoDB ObjectId
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt
      };

      // Customer information
      const customerInfo = {
        name: ticket.customerId.name,
        email: ticket.customerId.email
      };

      // Send email notifications (non-blocking)
      emailService.notifyNewTicket(ticketData, customerInfo, supportStaff)
        .then(results => {
          console.log('✅ Email notifications sent for ticket #' + ticket._id);
          console.log('📧 Email results:', results);
        })
        .catch(error => {
          console.error('❌ Failed to send email notifications:', error);
        });

    } catch (emailError) {
      console.error('❌ Email notification error:', emailError);
      // Don't fail ticket creation if email fails
    }
    
    const response = {
      _id: ticket._id,
      id: ticket.ticketNumber, // Use short ticket number for frontend
      ticketNumber: ticket.ticketNumber, // Also include as separate field
      ...ticket.toObject(),
      assignedTo: null,
      messages: [],
      attachments: [],
      history: []
    };
    
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (updateData.assignedTo && !mongoose.Types.ObjectId.isValid(updateData.assignedTo)) {
      const userMap = {
        '1': 'admin@company.com',
        '2': 'agent@company.com', 
        '3': 'customer@email.com'
      };
      
      const email = userMap[updateData.assignedTo];
      if (email) {
        const user = await User.findOne({ email });
        if (user) updateData.assignedTo = user._id;
      }
    }
    
    // Get the original ticket to check for status changes
    let originalTicket;
    if (req.params.id.startsWith('TKT-') || req.params.id.startsWith('T-')) {
      originalTicket = await Ticket.findOne({ ticketNumber: req.params.id });
    } else {
      originalTicket = await Ticket.findById(req.params.id);
    }
    
    let ticket;
    if (req.params.id.startsWith('TKT-') || req.params.id.startsWith('T-')) {
      ticket = await Ticket.findOneAndUpdate(
        { ticketNumber: req.params.id },
        updateData,
        { new: true }
      ).populate('customerId', 'name email').populate('assignedTo', 'name email');
    } else {
      ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate('customerId', 'name email').populate('assignedTo', 'name email');
    }
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if ticket status changed to "resolved" or "closed"
    if (originalTicket && 
        ['open', 'in-progress'].includes(originalTicket.status) && 
        ['resolved', 'closed'].includes(ticket.status)) {
      
      try {
        // Get the agent who resolved the ticket
        let resolvedByName = 'Support Team';
        if (ticket.assignedTo && ticket.assignedTo.name) {
          resolvedByName = ticket.assignedTo.name;
        }

        // Prepare resolution message
        const resolutionMessage = req.body.resolutionMessage || 
          'Your ticket has been resolved by our support team. If you need any further assistance, please don\'t hesitate to contact us.';

        // Customer information
        const customerInfo = {
          name: ticket.customerId.name,
          email: ticket.customerId.email
        };

        // Ticket data for email
        const ticketData = {
          id: ticket.ticketNumber || ticket._id.toString(),
          title: ticket.title,
          category: ticket.category,
          status: ticket.status
        };

        // Send resolution email (non-blocking)
        emailService.notifyTicketResolution(ticketData, customerInfo, resolutionMessage, resolvedByName)
          .then(result => {
            console.log('✅ Resolution email sent for ticket #' + (ticket.ticketNumber || ticket._id));
            console.log('📧 Email result:', result);
          })
          .catch(error => {
            console.error('❌ Failed to send resolution email:', error);
          });

      } catch (emailError) {
        console.error('❌ Resolution email error:', emailError);
        // Don't fail the update if email fails
      }
    }
    
    const response = {
      _id: ticket._id,
      id: ticket.ticketNumber || ticket._id.toString(),
      ticketNumber: ticket.ticketNumber,
      ...ticket.toObject(),
      assignedTo: ticket.assignedTo ? ticket.assignedTo._id.toString() : null
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    // Try to find by ticketNumber first, then by MongoDB ObjectId
    let ticket;
    if (req.params.id.startsWith('TKT-') || req.params.id.startsWith('T-')) {
      ticket = await Ticket.findOne({ ticketNumber: req.params.id })
        .populate('customerId', 'name email')
        .populate('assignedTo', 'name email');
    } else {
      ticket = await Ticket.findById(req.params.id)
        .populate('customerId', 'name email')
        .populate('assignedTo', 'name email');
    }
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const response = {
      _id: ticket._id,
      id: ticket.ticketNumber || ticket._id.toString(),
      ticketNumber: ticket.ticketNumber,
      ...ticket.toObject(),
      assignedTo: ticket.assignedTo ? ticket.assignedTo._id.toString() : null
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email Routes

// Manually send resolution email
app.post('/api/tickets/:id/send-resolution-email', async (req, res) => {
  try {
    let ticket;
    if (req.params.id.startsWith('TKT-') || req.params.id.startsWith('T-')) {
      ticket = await Ticket.findOne({ ticketNumber: req.params.id })
        .populate('customerId', 'name email')
        .populate('assignedTo', 'name email');
    } else {
      ticket = await Ticket.findById(req.params.id)
        .populate('customerId', 'name email')
        .populate('assignedTo', 'name email');
    }
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!ticket.customerId.email) {
      return res.status(400).json({ error: 'Customer email not found' });
    }

    const resolutionMessage = req.body.message || 
      'Your ticket has been resolved by our support team. If you need any further assistance, please don\'t hesitate to contact us.';

    const resolvedBy = req.body.resolvedBy || 
      (ticket.assignedTo ? ticket.assignedTo.name : 'Support Team');

    const customerInfo = {
      name: ticket.customerId.name,
      email: ticket.customerId.email
    };

    const ticketData = {
      id: ticket._id.toString(),
      title: ticket.title,
      category: ticket.category,
      status: ticket.status
    };

    const result = await emailService.notifyTicketResolution(
      ticketData, 
      customerInfo, 
      resolutionMessage, 
      resolvedBy
    );

    res.json({ 
      success: result.success, 
      message: result.success ? 'Resolution email sent successfully' : 'Failed to send email',
      details: result 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Template Routes (using simple mock data for now)
app.get('/api/templates', async (req, res) => {
  try {
    // Fetch templates from MongoDB
    const templates = await Template.find({ isActive: true });
    const formattedTemplates = templates.map(t => ({
      id: t._id.toString(),
      name: t.name,
      category: t.category,
      title: t.title,
      description: t.description,
      priority: t.priority,
      assignedTo: t.assignedTo,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));
    res.json({ success: true, data: formattedTemplates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const { name, category, title, description, priority, assignedTo } = req.body;
    if (!name || !category || !title || !description) {
      return res.status(400).json({ success: false, error: 'Name, category, title, and description are required' });
    }
    // Save template to MongoDB
    // Use a placeholder ObjectId for createdBy (replace with real user in production)
    const newTemplate = await Template.create({
      name,
      category,
      title,
      description,
      priority: priority || 'medium',
      assignedTo,
      isActive: true,
      createdBy: '000000000000000000000000' // <-- placeholder ObjectId
    });
    res.status(201).json({ success: true, data: {
      id: newTemplate._id.toString(),
      name: newTemplate.name,
      category: newTemplate.category,
      title: newTemplate.title,
      description: newTemplate.description,
      priority: newTemplate.priority,
      assignedTo: newTemplate.assignedTo,
      isActive: newTemplate.isActive,
      createdAt: newTemplate.createdAt,
      updatedAt: newTemplate.updatedAt
    }});
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/templates/:id', async (req, res) => {
  try {
    const { name, category, title, description, priority, assignedTo } = req.body;
    
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Update template fields
    if (name !== undefined) template.name = name;
    if (category !== undefined) template.category = category;
    if (title !== undefined) template.title = title;
    if (description !== undefined) template.description = description;
    if (priority !== undefined) template.priority = priority;
    if (assignedTo !== undefined) template.assignedTo = assignedTo;

    await template.save();
    await template.populate('createdBy', 'name email');

    // Format response for frontend
    const formattedTemplate = {
      id: template._id.toString(),
      name: template.name,
      category: template.category,
      title: template.title,
      description: template.description,
      priority: template.priority,
      assignedTo: template.assignedTo,
      isActive: template.isActive,
      createdBy: template.createdBy,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };

    res.json({ success: true, data: formattedTemplate });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Soft delete by setting isActive to false
    template.isActive = false;
    await template.save();

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Performance Analytics Routes
app.get('/api/performance/overview', async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const resolvedTickets = await Ticket.countDocuments({ status: { $in: ['resolved', 'closed'] } });
    const activeAgents = await User.countDocuments({ role: 'support-agent' });
    
    // Calculate average response and resolution times
    const tickets = await Ticket.find({ status: { $in: ['resolved', 'closed'] } })
      .select('createdAt updatedAt messages');
    
    let totalResponseTime = 0;
    let totalResolutionTime = 0;
    let ticketsWithResponse = 0;
    
    tickets.forEach(ticket => {
      if (ticket.messages && ticket.messages.length > 0) {
        const firstResponse = ticket.messages.find(m => !m.isInternal);
        if (firstResponse) {
          const responseTime = new Date(firstResponse.timestamp) - new Date(ticket.createdAt);
          totalResponseTime += responseTime;
          ticketsWithResponse++;
        }
      }
      
      const resolutionTime = new Date(ticket.updatedAt) - new Date(ticket.createdAt);
      totalResolutionTime += resolutionTime;
    });
    
    const avgResponseTime = ticketsWithResponse > 0 ? 
      Math.round(totalResponseTime / ticketsWithResponse / (1000 * 60 * 60) * 100) / 100 : 0;
    const avgResolutionTime = tickets.length > 0 ? 
      Math.round(totalResolutionTime / tickets.length / (1000 * 60 * 60) * 100) / 100 : 0;
    
    res.json({
      totalTickets,
      resolvedTickets,
      avgResponseTime: `${avgResponseTime}h`,
      avgResolutionTime: `${avgResolutionTime}h`,
      customerSatisfaction: 4.6, // Mock for now
      activeAgents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/performance/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'support-agent' }).select('name email');
    
    const agentPerformance = await Promise.all(agents.map(async (agent) => {
      const totalTickets = await Ticket.countDocuments({ assignedTo: agent._id });
      const resolvedTickets = await Ticket.countDocuments({ 
        assignedTo: agent._id, 
        status: { $in: ['resolved', 'closed'] } 
      });
      
      // Calculate average response time for this agent
      const agentTickets = await Ticket.find({ 
        assignedTo: agent._id,
        status: { $in: ['resolved', 'closed'] }
      }).select('createdAt messages');
      
      let totalResponseTime = 0;
      let ticketsWithResponse = 0;
      
      agentTickets.forEach(ticket => {
        if (ticket.messages && ticket.messages.length > 0) {
          const firstResponse = ticket.messages.find(m => !m.isInternal);
          if (firstResponse) {
            const responseTime = new Date(firstResponse.timestamp) - new Date(ticket.createdAt);
            totalResponseTime += responseTime;
            ticketsWithResponse++;
          }
        }
      });
      
      const avgTime = ticketsWithResponse > 0 ? 
        Math.round(totalResponseTime / ticketsWithResponse / (1000 * 60 * 60) * 100) / 100 : 0;
      
      return {
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        tickets: totalTickets,
        resolved: resolvedTickets,
        avgTime: `${avgTime}h`,
        rating: (4.2 + Math.random() * 0.8).toFixed(1) // Mock rating for now
      };
    }));
    
    res.json(agentPerformance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Message Routes
app.post('/api/tickets/:id/messages', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketNumber: req.params.id });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get sender user info for avatar
    const senderUser = await User.findById(req.body.senderId);
    
    const message = {
      id: new mongoose.Types.ObjectId().toString(),
      ticketId: req.params.id,
      userId: req.body.senderId,
      userName: req.body.senderName,
      userAvatar: senderUser?.avatar || null,
      content: req.body.content,
      timestamp: new Date().toISOString(),
      isInternal: req.body.isInternal || false
    };
    
    ticket.messages.push(message);
    ticket.updatedAt = new Date();
    await ticket.save();
    
    console.log(`💬 New message added to ticket #${ticket._id}`);
    console.log(`💬 From: ${message.userName} (${message.userId})`);
    console.log(`💬 Content: ${message.content.substring(0, 50)}...`);
    
    // Send email notifications (non-blocking, only if not internal message)
    if (!message.isInternal) {
      try {
        // Use already fetched sender user info
        
        // Determine recipient based on sender role
        let recipientUser = null;
        
        if (senderUser) {
          if (senderUser.role === 'customer') {
            // Customer sent message - notify assigned agent or all agents
            if (ticket.assignedTo) {
              recipientUser = await User.findById(ticket.assignedTo);
              console.log(`📧 Notifying assigned agent: ${recipientUser?.email}`);
            } else {
              // Notify all support agents and administrators
              const supportStaff = await User.find({ 
                role: { $in: ['support-agent', 'administrator'] } 
              });
              console.log(`📧 Notifying ${supportStaff.length} support staff members`);
              
              // Send to all support staff
              for (const staff of supportStaff) {
                emailService.notifyNewMessage(ticket, message, staff, senderUser)
                  .then(() => console.log(`✅ Notification sent to ${staff.email}`))
                  .catch(err => console.error(`❌ Failed to notify ${staff.email}:`, err));
              }
            }
          } else if (senderUser.role === 'support-agent' || senderUser.role === 'administrator') {
            // Agent/Admin sent message - notify customer
            recipientUser = await User.findById(ticket.customerId);
            console.log(`📧 Notifying customer: ${recipientUser?.email}`);
          }
          
          // Send notification to single recipient (if applicable)
          if (recipientUser) {
            emailService.notifyNewMessage(ticket, message, recipientUser, senderUser)
              .then(result => {
                if (result.success) {
                  console.log(`✅ Message notification sent to ${recipientUser.email}`);
                } else {
                  console.error(`❌ Failed to send notification: ${result.error}`);
                }
              })
              .catch(err => console.error('❌ Email notification error:', err));
          }
        }
      } catch (emailError) {
        console.error('❌ Error processing email notifications:', emailError);
        // Don't fail the message creation if email fails
      }
    }
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test email endpoint
app.get('/api/email/test', async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');

    const testRecipient = process.env.EMAIL_TEST_RECIPIENT || process.env.EMAIL_FROM || process.env.EMAIL_USER;
    if (!testRecipient) {
      throw new Error('Set EMAIL_TEST_RECIPIENT (or EMAIL_FROM/EMAIL_USER) so the test email has a destination.');
    }

    const result = await emailService.sendEmail(
      testRecipient,
      'SupportDesk Email Test',
      '<h2>✅ Email Test Successful!</h2><p>Your email configuration is working correctly.</p>',
      'Email Test Successful! Your email configuration is working correctly.'
    );

    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      result: result
    });
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Email configuration needs to be set up'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  const response = {
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  };
  
  console.log('🏥 Health check requested:', dbStatus);
  res.json(response);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Start server
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Customer Support Backend Server');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌐 API Base: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔗 MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);

  try {
    await emailService.initTransporter();
  } catch (error) {
    console.error('❌ Email service initialization error:', error.message || error);
  }

  const emailStatus = emailService.getStatus();
  const emailMode = emailStatus.ready
    ? 'Configured'
    : emailStatus.demoMode
      ? 'Demo mode (emails will not send)'
      : 'Not configured';

  console.log(`📧 Email: ${emailMode}`);
  if (emailStatus.fromEmail) {
    console.log(`📧 Email From: ${emailStatus.fromEmail}`);
  }
  if (emailStatus.provider) {
    console.log(`📧 Email Provider: ${emailStatus.provider}`);
  }
  console.log(`📧 Email Host: ${emailStatus.host}:${emailStatus.port}`);
  if (!emailStatus.ready && !emailStatus.demoMode) {
    console.log('⚠️ Configure SENDGRID_API_KEY (and verify your sender) to enable production email delivery.');
  }
  console.log('='.repeat(50) + '\n');
  
  console.log('✅ Backend server is ready for connections!');
});