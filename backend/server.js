import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Ticket from './models/Ticket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

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
    
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customerId', 'name email').populate('assignedTo', 'name email');
    
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