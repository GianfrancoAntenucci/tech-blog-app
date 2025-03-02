const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ensure all required fields are present
    const formattedPost = {
      id: post.id,
      title: post.title || 'Untitled',
      content: post.content || 'No content available',
      username: post.username || 'Anonymous',
      user_id: post.user_id,
      created_at: post.created_at
    };
    
    res.json(formattedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Create a new post (requires auth)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        message: 'Title and content are required' 
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    console.log('Creating post:', { 
      title, 
      content: content.substring(0, 50) + '...', 
      user_id: req.user.id 
    });

    const post = await Post.create({
      title,
      content,
      user_id: req.user.id
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating post' 
    });
  }
});

// Update a post (requires auth)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { title, content } = req.body;

    // Input validation
    if (!title || !content) {
      return res.status(400).json({ 
        message: 'Title and content are required' 
      });
    }

    // Update post
    const updatedPost = await Post.update(postId, userId, { title, content });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      message: error.message || 'Error updating post' 
    });
  }
});

// Delete a post (requires auth)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if post exists and user owns it
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.delete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;
