const express = require('express');
const router = express.Router();

const Song = require('../models/song');



router.get('/new', (req, res) => {
  res.json({ message: 'Render new song form' });
});

// router.post('/', async (req, res) => {
//   try {
//     // attach the currently logged-in user as the owner
//     if (req.session && req.session.user && req.session.user._id) {
//       req.body.userId = req.session.user._id;
//     }
//     await Song.create(req.body);
//     res.redirect('/songs');
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// to show a specific songs details 
router.get('/:id', async (req, res) => {
    try {
      const song = await Song.findById(req.params.id);
      if (!song) return res.status(404).json({ err: 'Song not found' });
      res.json(song);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
});



// important to delete each song inside the album
// router.delete('/:id', async (req, res) => {
//   try {
//     const song = await Song.findById(req.params.id);
//     if (!song) return res.redirect('/songs');

//     const ownerId = song.userId ? song.userId.toString() : null;
//     const sessionId = req.session && req.session.user ? req.session.user._id.toString() : null;

//     if (ownerId && sessionId && ownerId === sessionId) {
//       await Song.findByIdAndDelete(req.params.id);
//       res.redirect('/songs');
//     } else {
//       console.log('Permission denied');
//       res.redirect('/songs');
//     }
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

module.exports = router;
