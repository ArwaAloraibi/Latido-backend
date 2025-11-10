const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');

// Create a new playlist
router.post('/', async (req, res) => {
  try {
    const { user_id, songs, name, totalDuration } = req.body;
    const playlist = new Playlist({ playlist_id: new Playlist()._id, user_id, songs, name, totalDuration });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ err: 'Failed to create playlist' });
  }
});

// Get all playlists, including populated user and songs info
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find().populate('user_id').populate('songs');
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ err: 'Failed to fetch playlists' });
  }
});

// Get a specific playlist by its ID, with populated user and songs
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('user_id').populate('songs');
    if (!playlist) return res.status(404).json({ err: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ err: 'Failed to fetch playlist' });
  }
});

// Update an existing playlist by its ID
router.put('/:id', async (req, res) => {
  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlaylist) return res.status(404).json({ err: 'Playlist not found' });
    res.json(updatedPlaylist);
  } catch (err) {
    res.status(500).json({ err: 'Failed to update playlist' });
  }
});

// Delete a playlist by its ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(req.params.id);
    if (!deletedPlaylist) return res.status(404).json({ err: 'Playlist not found' });
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ err: 'Failed to delete playlist' });
  }
});

module.exports = router;
