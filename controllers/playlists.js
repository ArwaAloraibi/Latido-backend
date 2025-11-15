const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');
const Song = require('../models/song');
const User = require('../models/user');

// Create a new playlist with songs
router.post('/', async (req, res) => {
  try {
    const { listener, songs, name, totalDuration } = req.body;

    // Create new playlist initially (empty songs array)
    const newPlaylist = new Playlist({
      listener,
      name,
      totalDuration,
      songs: []
    });
    await newPlaylist.save();

    let createdSongs = [];
    if (Array.isArray(songs) && songs.length > 0) {
      // Accept array of strings (song titles) or song objects
      const songDocsData = songs.map(songData => {
        if (typeof songData === 'string') {
          return { name: songData, playlist: newPlaylist._id, artist: listener };
        }
        return Object.assign({}, songData, { playlist: newPlaylist._id, artist: listener });
      });

      // Create song documents
      createdSongs = await Song.insertMany(songDocsData);

      // Associate created song ObjectIds with playlist
      newPlaylist.songs = createdSongs.map(s => s._id);
      await newPlaylist.save();
    }

    // Add playlist to user's playlists
    const user = await User.findById(listener);
    if (user) {
      if (!user.playlists) user.playlists = [];
      user.playlists.push(newPlaylist._id);
      await user.save();
    }

    // Populate listener and songs for API response
    const populated = await Playlist.findById(newPlaylist._id)
      .populate('songs')
      .populate('listener');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Get all playlists, with user and songs info
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('listener')
      .populate('songs');
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ err: 'Failed to fetch playlists' });
  }
});

// Get a specific playlist by its ID, fully populated
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('listener')
      .populate('songs');
    if (!playlist) return res.status(404).json({ err: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ err: 'Failed to fetch playlist' });
  }
});

// Update an existing playlist by its ID
router.put('/:id', async (req, res) => {
  try {
    const { songs } = req.body;
    let updateObject = { ...req.body };
    if (songs && Array.isArray(songs)) {
      updateObject.songs = songs;
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    );
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
