const express = require('express');

const router = express.Router();

const User = require('../models/user');

router.get('/', async (req, res) => {
  try {
    // Get a list of all users, but only return their username and _id
    const users = await User.find({}, 'username');

    res.json(users);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/current-user', async (req, res) => {
  try {
    // Get a list of all currently logged in users, but only return their username and _id
    const user = await User.findById(req.user._id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Get user by id
    const user = await User.findById(req.params.id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/:id/features', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json(
      { 
        err: 'User not found' 
      }
    );

    let availableFeatures = [];

    if (user.role === 'artist') {
      availableFeatures = 
      [
        'create_album',
        'edit_album',
        'delete_album',
        'add_song_to_album',
        'edit_song_in_album',
        'delete_song_from_album'
      ];
    } else {
      availableFeatures = 
      [
        'create_playlist',
        'add_song_to_playlist',
        'edit_playlist',
        'delete_playlist'
      ];
    }

    res.json({ role: user.role, availableFeatures });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
