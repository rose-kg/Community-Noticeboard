// Express server with MongoDB (Mongoose) integration for announcements
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Simple authentication middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`;
  if (!authHeader || authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized access. Admin authentication required.' });
  }
  next();
};

// Connect to MongoDB with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community-noticeboard');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('📝 Running in demo mode without database persistence');
    
    // For demo purposes, we'll continue without MongoDB
    // In production, you should have proper error handling
  }
};

connectDB();

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['Jobs', 'Events', 'Alerts', 'General'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Announcement = mongoose.model('Announcement', announcementSchema);

// In-memory storage fallback for demo
let memoryAnnouncements = [
  {
    id: '1',
    title: '🎉 Welcome to Community Noticeboard!',
    content: 'This is a demo announcement. The admin can add, edit, and delete announcements. Regular users can only view them.',
    category: 'General',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2', 
    title: '🔧 Database Setup Required',
    content: 'For full functionality, please connect a MongoDB database by setting MONGODB_URI environment variable.',
    category: 'Alerts',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === adminPassword) {
    res.json({ success: true, token: adminPassword });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Get all announcements
app.get('/api/announcements', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const announcements = await Announcement.find().sort({ createdAt: -1 });
      res.json(announcements);
    } else {
      // Use in-memory storage
      res.json(memoryAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get announcement by ID
app.get('/api/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Not found' });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create announcement (admin only)
app.post('/api/announcements', requireAuth, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const now = new Date();
    
    if (isMongoConnected()) {
      const announcement = new Announcement({ title, content, category, createdAt: now, updatedAt: now });
      await announcement.save();
      res.status(201).json(announcement);
    } else {
      // Use in-memory storage
      const newAnnouncement = {
        id: Date.now().toString(),
        title,
        content,
        category,
        createdAt: now,
        updatedAt: now
      };
      memoryAnnouncements.push(newAnnouncement);
      res.status(201).json(newAnnouncement);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update announcement (admin only)
app.put('/api/announcements/:id', requireAuth, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    if (isMongoConnected()) {
      const updated = await Announcement.findByIdAndUpdate(
        req.params.id,
        { title, content, category, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json(updated);
    } else {
      // Use in-memory storage
      const index = memoryAnnouncements.findIndex(a => a.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Not found' });
      
      memoryAnnouncements[index] = {
        ...memoryAnnouncements[index],
        title,
        content,
        category,
        updatedAt: new Date()
      };
      res.json(memoryAnnouncements[index]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete announcement (admin only)
app.delete('/api/announcements/:id', requireAuth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const deleted = await Announcement.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true });
    } else {
      // Use in-memory storage
      const index = memoryAnnouncements.findIndex(a => a.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Not found' });
      
      memoryAnnouncements.splice(index, 1);
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Community Noticeboard Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/community-noticeboard'}`);
});
