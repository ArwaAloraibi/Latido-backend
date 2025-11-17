const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Album = require('../models/album');
const Song = require('../models/song');
const upload = require('../middleware/upload');
const path = require('path');

// show all albums
router.get('/', async (req, res) => {
  try {
    const albums = await Album.find()
      .populate({
        path: 'songs',
        populate: { path: 'artist', select: 'username' }
      })
      .populate('userId', 'username');
    res.json(albums);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Create a new album
router.get('/new', async (req, res) => {
  res.json({ message: 'Render new album form' });
});

// Helper function to get file URL
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  // Normalize the path (handle both Windows and Unix paths)
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Find 'uploads' in the path and extract everything after it
  const uploadsMatch = normalizedPath.match(/uploads\/(.+)$/);
  if (uploadsMatch) {
    return `${baseUrl}/uploads/${uploadsMatch[1]}`;
  }
  
  // Fallback: try to find 'uploads' in path parts
  const pathParts = normalizedPath.split('/');
  const uploadsIndex = pathParts.findIndex(part => part === 'uploads');
  
  if (uploadsIndex !== -1 && uploadsIndex < pathParts.length - 1) {
    const relativePath = pathParts.slice(uploadsIndex + 1).join('/');
    return `${baseUrl}/uploads/${relativePath}`;
  }
  
  console.error('Could not extract uploads path from:', filePath);
  return null;
};

// post the newly created album (with file uploads)
router.post('/', upload.any(), async (req, res) => {
  try {
    const { name } = req.body;
    
    // Organize uploaded files by fieldname
    const filesByField = {};
    if (req.files) {
      req.files.forEach(file => {
        if (!filesByField[file.fieldname]) {
          filesByField[file.fieldname] = [];
        }
        filesByField[file.fieldname].push(file);
      });
    }
    
    // Handle album cover image
    let coverImgUrl = null;
    const coverImgFiles = filesByField['coverImg'] || [];
    if (coverImgFiles[0]) {
      coverImgUrl = getFileUrl(req, coverImgFiles[0].path);
    }

    const newAlbum = new Album({ 
      name, 
      userId: req.user._id,
      coverImg: coverImgUrl
    });
    await newAlbum.save();

    // Process songs
    const songs = [];
    let songIndex = 0;
    
    // Extract song data from form fields
    while (req.body[`songName_${songIndex}`]) {
      const songName = req.body[`songName_${songIndex}`];
      const songDuration = parseInt(req.body[`songDuration_${songIndex}`]) || 0;
      
      // Get MP3 file
      const mp3Files = filesByField[`songMP3_${songIndex}`] || [];
      const mp3File = mp3Files[0] || null;
      const audioUrl = mp3File ? getFileUrl(req, mp3File.path) : null;
      
      // Get cover image
      const coverImgFiles = filesByField[`songCoverImg_${songIndex}`] || [];
      const coverImgFile = coverImgFiles[0] || null;
      const songCoverImgUrl = coverImgFile ? getFileUrl(req, coverImgFile.path) : null;
      
      if (songName && audioUrl) {
        songs.push({
          name: songName,
          duration: songDuration,
          album: newAlbum._id,
          artist: req.user._id,
          audioUrl: audioUrl,
          coverImg: songCoverImgUrl
        });
      }
      
      songIndex++;
    }

    // Bulk insert songs
    if (songs.length > 0) {
      const createdSongs = await Song.insertMany(songs);
      newAlbum.songs = createdSongs.map(s => s._id);
      await newAlbum.save();
    }

    // Add album to user's albums array
    const user = await User.findById(req.user._id);
    if (user) {
      user.albums.push(newAlbum._id);
      await user.save();
    }

    // populate songs for response
    const populated = await Album.findById(newAlbum._id).populate('songs').populate('userId', 'username');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// show songs inside a specific album
router.get('/:albumId', async (req, res) => {
  try {
    const album = await Album.findById(req.params.albumId).populate('songs').populate('userId', 'username');
    if (!album) return res.status(404).json({ err: 'Album not found' });
    res.json(album.songs);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// edit the album
router.get('/:albumId/edit', async (req, res) => {
  try {
    const album = await Album.findById(req.params.albumId).populate('songs').populate('userId', 'username');
    if (!album) return res.status(404).json({ err: 'Album not found' });
    res.json({ message: 'Render edit album form', album });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// update the album
router.put('/:albumId', async (req, res) => {
  try {
    const { name, songs } = req.body;
    const album = await Album.findByIdAndUpdate(
      req.params.albumId,
      { name },
      { new: true }
    ).populate('songs').populate('userId', 'username');

    if (!album) return res.status(404).json({ err: 'Album not found' });

    // If songs provided, add new songs to album
    if (Array.isArray(songs) && songs.length > 0) {
      const songDocsData = songs.map(songData => {
        if (typeof songData === 'string') {
          return { name: songData, album: album._id, artist: req.user._id };
        }
        return Object.assign({}, songData, { album: album._id, artist: req.user._id });
      });

      const createdSongs = await Song.insertMany(songDocsData);
      album.songs = [...album.songs.map(s => s._id || s), ...createdSongs.map(s => s._id)];
      await album.save();
    }

    const populated = await Album.findById(album._id).populate('songs').populate('userId', 'username');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// delete the album
router.delete('/:albumId', async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.albumId);
    if (!album) return res.status(404).json({ err: 'Album not found' });

    // Remove album reference from user
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { albums: album._id }
    });

    res.json({ message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
