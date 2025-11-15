const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');
const Song = require('../models/song'); 
const User = require('../models/user'); 


// Create a new playlist with songs
router.post('/', async (req, res) => {
  try {
    const { user_id, songs, name, totalDuration } = req.body;
    // Create new playlist without songs initially
    const newPlaylist = new Playlist({ user_id, name, totalDuration });
    await newPlaylist.save();

    if (Array.isArray(songs) && songs.length > 0) {
      // Normalize song input: accept array of strings (titles) or array of objects
      const songDocsData = songs.map(songData => {
        if (typeof songData === 'string') {
          return { name: songData, playlist: newPlaylist._id, artist: user_id };
        }
        // assume object
        return Object.assign({}, songData, { playlist: newPlaylist._id, artist: user_id });
      });

      // Bulk insert songs
      const createdSongs = await Song.insertMany(songDocsData);

      // Attach song ids to playlist and save
      newPlaylist.songs = createdSongs.map(s => s._id);
      await newPlaylist.save();
    }

    // Add playlist to user's playlists array
    const user = await User.findById(user_id);
    if (user) {
      user.playlists.push(newPlaylist._id);
      await user.save();
    }

    // Populate songs for response
    const populated = await Playlist.findById(newPlaylist._id).populate('songs').populate('user_id');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ err: err.message });
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
