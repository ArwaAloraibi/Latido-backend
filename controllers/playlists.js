const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');
const Song = require('../models/song');
const User = require('../models/user');
const upload = require('../middleware/upload');
const path = require('path');

// Helper function to get file URL
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const relativePath = filePath.replace(path.join(__dirname, '../'), '').replace(/\\/g, '/');
  return `${baseUrl}/${relativePath}`;
};

// Create a new playlist with songs
router.post('/', upload.single('coverImg'), async (req, res) => {
  try {
    const { listener, songs, name } = req.body;
    
    // Handle cover image
    let coverImgUrl = null;
    if (req.file) {
      coverImgUrl = getFileUrl(req, req.file.path);
    }

    // Calculate total duration from songs if provided
    let totalDuration = 0;
    let songIds = [];
    
    // Parse songs if it's a JSON string
    let songsArray = [];
    if (songs) {
      try {
        songsArray = typeof songs === 'string' ? JSON.parse(songs) : songs;
      } catch (e) {
        songsArray = Array.isArray(songs) ? songs : [];
      }
    }

    if (Array.isArray(songsArray) && songsArray.length > 0) {
      // If songs are objects with duration, calculate total
      const songDurations = songsArray.map(s => {
        if (typeof s === 'object' && s.duration) {
          return s.duration;
        }
        return 0;
      });
      totalDuration = songDurations.reduce((sum, d) => sum + d, 0);
      songIds = songsArray.map(s => typeof s === 'object' ? s._id || s : s);
    }

    const newPlaylist = new Playlist({
      listener,
      name,
      totalDuration,
      songs: songIds,
      coverImg: coverImgUrl
    });

    await newPlaylist.save();

    // If songs were provided as new song objects (not just IDs), create them
    let createdSongs = [];
    if (Array.isArray(songsArray) && songsArray.length > 0 && typeof songsArray[0] === 'object' && songsArray[0].name) {
      const songDocsData = songsArray.map(songData => {
        if (typeof songData === 'string') {
          return { name: songData, playlist: newPlaylist._id, artist: listener };
        }
        return Object.assign({}, songData, { playlist: newPlaylist._id, artist: listener });
      });

      createdSongs = await Song.insertMany(songDocsData);
      newPlaylist.songs = createdSongs.map(s => s._id);
      
      // Recalculate total duration from created songs
      totalDuration = createdSongs.reduce((sum, song) => sum + (song.duration || 0), 0);
      newPlaylist.totalDuration = totalDuration;
      await newPlaylist.save();
    }

    const user = await User.findById(listener);
    if (user) {
      if (!user.playlists) user.playlists = [];
      user.playlists.push(newPlaylist._id);
      await user.save();
    }

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
router.put('/:id', upload.single('coverImg'), async (req, res) => {
  try {
    const { songs, name } = req.body;
    let updateObject = {};

    if (name) {
      updateObject.name = name;
    }

    // Handle cover image update
    if (req.file) {
      updateObject.coverImg = getFileUrl(req, req.file.path);
    }

    if (songs) {
      let songsArray = [];
      try {
        songsArray = typeof songs === 'string' ? JSON.parse(songs) : songs;
      } catch (e) {
        songsArray = Array.isArray(songs) ? songs : [];
      }

      if (Array.isArray(songsArray)) {
        updateObject.songs = songsArray;
        
        // Calculate total duration from song IDs
        if (songsArray.length > 0) {
          const songDocs = await Song.find({ _id: { $in: songsArray } });
          const totalDuration = songDocs.reduce((sum, song) => sum + (song.duration || 0), 0);
          updateObject.totalDuration = totalDuration;
        } else {
          updateObject.totalDuration = 0;
        }
      }
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    )
      .populate('songs')
      .populate('listener');

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
