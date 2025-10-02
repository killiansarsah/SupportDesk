import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true, required: true }, // Short, readable ticket ID
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'resolved', 'closed'], 
    default: 'open' 
  },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  language: { type: String, default: 'en' },
  attachments: [{
    id: String,
    name: String,
    size: Number,
    type: String,
    url: String,
    uploadedAt: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  messages: [{
    id: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    content: String,
    timestamp: Date,
    isInternal: { type: Boolean, default: false },
    language: String
  }],
  internalNotes: [{
    id: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    content: String,
    timestamp: Date
  }],
  history: [{
    id: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    action: String,
    details: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

export default mongoose.model('Ticket', ticketSchema);