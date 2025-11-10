const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Album = require('../models/album');
const Song = require('../models/song');


// show all albums
router.get('/', async (req, res) => {

 try {
    const albums = await Album.find().populate('songs');
    res.json(albums);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
  
});

// Create a new album
router.get('/new', async (req, res) => {
  res.json({ message: 'Render new album form' });
});

// post the newly created album
router.post('/', async (req, res) => {
  try {
    const { name, songs } = req.body;
    const newAlbum = new Album({ name, artist: req.user._id });
    await newAlbum.save();

    if (Array.isArray(songs) && songs.length > 0) {
      // normalize song input: accept array of strings (titles) or array of objects
      const songDocsData = songs.map(songData => {
        if (typeof songData === 'string') {
          return { name: songData, album: newAlbum._id, artist: req.user._id };
        }
        // assume object
        return Object.assign({}, songData, { album: newAlbum._id, artist: req.user._id });
      });

      // bulk insert songs
      const createdSongs = await Song.insertMany(songDocsData);

      // attach song ids to album and save
      newAlbum.songs = createdSongs.map(s => s._id);
      await newAlbum.save();
    }

    // Add album to user's albums array
    const user = await User.findById(req.user._id);
    user.albums.push(newAlbum._id);
    await user.save();

     // populate songs for response
    const populated = await Album.findById(newAlbum._id).populate('songs');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});



// show songs inside a spesific  album
router.get('/:albumId', async (req, res) => {

    try {
    const album = await Album.findById(req.params.albumId).populate('songs');
    if (!album) return res.status(404).json({ err: 'Album not found' });
    res.json(album.songs);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
  
});

// edit the album
router.get('/:albumId/edit', async (req, res) => {

  try {
    const album = await Album.findById(req.params.albumId).populate('songs');
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
     ).populate('songs'); 
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
       album.songs = createdSongs.map(s => s._id);
       await album.save();
    }

    res.json(album);

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
