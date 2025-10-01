import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Ticket from './models/Ticket.js';
import emailService from './emailService.js';

const app = express();
const PORT = process.env.PORT || 3002;
console.log('🔧 Backend env check:', {
  cwd: process.cwd(),
  envFileExists: true,
  googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.slice(0, 20) || 'undefined'
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
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
        id: ticket._id.toString(),
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

    const ticket = new Ticket({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      customerId,
      language: req.body.language || 'en'
    });
    
    await ticket.save();
    await ticket.populate('customerId', 'name email');
    
    // Send email notifications
    try {
      // Get all support agents and administrators
      const supportStaff = await User.find({
        role: { $in: ['support-agent', 'administrator'] },
        email: { $exists: true, $ne: '' }
      }).select('name email role');

      // Prepare ticket data for email
      const ticketData = {
        id: ticket._id.toString(),
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
      id: ticket._id.toString(),
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
    const originalTicket = await Ticket.findById(req.params.id);
    
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customerId', 'name email').populate('assignedTo', 'name email');
    
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
          id: ticket._id.toString(),
          title: ticket.title,
          category: ticket.category,
          status: ticket.status
        };

        // Send resolution email (non-blocking)
        emailService.notifyTicketResolution(ticketData, customerInfo, resolutionMessage, resolvedByName)
          .then(result => {
            console.log('✅ Resolution email sent for ticket #' + ticket._id);
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
      id: ticket._id.toString(),
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
    const ticket = await Ticket.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const response = {
      _id: ticket._id,
      id: ticket._id.toString(),
      ...ticket.toObject(),
      assignedTo: ticket.assignedTo ? ticket.assignedTo._id.toString() : null
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email Routes
// Test email configuration
app.get('/api/email/test', async (req, res) => {
  try {
    const result = await emailService.testEmailConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manually send resolution email
app.post('/api/tickets/:id/send-resolution-email', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('assignedTo', 'name email');
    
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

// Message Routes
app.post('/api/tickets/:id/messages', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const message = {
      id: new mongoose.Types.ObjectId().toString(),
      ticketId: req.params.id,
      userId: req.body.senderId,
      userName: req.body.senderName,
      content: req.body.content,
      timestamp: new Date().toISOString(),
      isInternal: req.body.isInternal || false
    };
    
    ticket.messages.push(message);
    ticket.updatedAt = new Date();
    await ticket.save();
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  console.log('='.repeat(50) + '\n');
  
  console.log('✅ Backend server is ready for connections!');
});