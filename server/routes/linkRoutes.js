import express from 'express';
import Link from '../models/linkModel.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all links for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const links = await Link.find({ user: req.user._id }).sort({ isPinned: -1, createdAt: -1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching links', error: error.message });
  }
});

// Create a new link
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { url, title, description, category, favicon, image, isPinned } = req.body;
    
    const link = new Link({
      url,
      title,
      description: description || '',
      category: category || 'Other',
      favicon: favicon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
      image: image || '',
      isPinned: isPinned || false,
      user: req.user._id
    });
    
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: 'Error creating link', error: error.message });
  }
});

// Update a link
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Error updating link', error: error.message });
  }
});

// Delete a link
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting link', error: error.message });
  }
});

// Toggle pin status
router.patch('/:id/pin', authMiddleware, async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    link.isPinned = !link.isPinned;
    await link.save();
    
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling pin', error: error.message });
  }
});

export default router;
