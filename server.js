// Express server with MongoDB (Mongoose) integration for announcements
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
  if (!authHeader || authHeader !== 'Bearer admin123') {
    return res.status(401).json({ error: 'Unauthorized access. Admin authentication required.' });
  }
  next();
};

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/community-noticeboard');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['Jobs', 'Events', 'Alerts', 'General'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Announcement = mongoose.model('Announcement', announcementSchema);

// Get all announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
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
    const announcement = new Announcement({ title, content, category, createdAt: now, updatedAt: now });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update announcement (admin only)
app.put('/api/announcements/:id', requireAuth, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, category, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete announcement (admin only)
app.delete('/api/announcements/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
