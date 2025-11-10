// const express = require('express');
// const router = express.Router();

// const Album = require('../models/album');
// const Song = require('../models/song');

// // INDEX — 
// router.get('/', async (req, res) => {
//   try {
//     const albums = await Album.find({}).populate('userId');
//     res.render('albums/index.ejs', { albums });
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// // NEW —
// router.get('/new', (req, res) => {
//   res.render('albums/new.ejs');
// });

// // CREATE 
// router.post('/', async (req, res) => {
//   try {
//     if (req.session && req.session.user && req.session.user._id) {
//       req.body.userId = req.session.user._id;
//     }
//     await Album.create(req.body);
//     res.redirect('/albums');
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// // SHOW — 
// router.get('/:id', async (req, res) => {
//   try {
//     const album = await Album.findById(req.params.id)
//       .populate('userId')
//       .populate('song'); 
//     res.render('albums/show.ejs', { album });
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// // EDIT 
// router.get('/:id/edit', async (req, res) => {
//   try {
//     const album = await Album.findById(req.params.id);
//     res.render('albums/edit.ejs', { album });
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// // UPDATE — 
// router.put('/:id', async (req, res) => {
//   try {
//     const album = await Album.findById(req.params.id);
//     if (!album) return res.redirect('/albums');

//     const ownerId = album.userId ? album.userId.toString() : null;
//     const sessionId = req.session && req.session.user ? req.session.user._id.toString() : null;

//     if (ownerId && sessionId && ownerId === sessionId) {
//       await Album.findByIdAndUpdate(req.params.id, req.body, { new: true });
//       res.redirect(`/albums/${req.params.id}`);
//     } else {
//       console.log('Permission denied');
//       res.redirect('/albums');
//     }
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     const album = await Album.findById(req.params.id);
//     if (!album) return res.redirect('/albums');

//     const ownerId = album.userId ? album.userId.toString() : null;
//     const sessionId = req.session && req.session.user ? req.session.user._id.toString() : null;

//     if (ownerId && sessionId && ownerId === sessionId) {
//       await Album.findByIdAndDelete(req.params.id);
//       res.redirect('/albums');
//     } else {
//       console.log('Permission denied');
//       res.redirect('/albums');
//     }
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// // ADD SONG TO ALBUM —  
// router.post('/:id/songs', async (req, res) => {
//   try {
//     const album = await Album.findById(req.params.id);
//     if (!album) return res.redirect('/albums');

//     // attach the current user as owner if present
//     if (req.session && req.session.user && req.session.user._id) {
//       req.body.userId = req.session.user._id;
//     }

//     // create the song (spread req.body into a new object)
//     const newSong = await Song.create({ ...req.body });

//     // associate created song with album (album schema uses `song`)
//     album.song = newSong._id;
//     await album.save();

//     res.redirect(`/albums/${req.params.id}`);
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });