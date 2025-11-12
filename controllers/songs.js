const express = require('express');
const router = express.Router();

const Song = require('../models/song');



router.get('/new', (req, res) => {
  res.json({ message: 'Render new song form' });
});

router.post('/', async (req, res) => {
  try {
    // attach the currently logged-in user as the owner
    if (req.session && req.session.user && req.session.user._id) {
      req.body.userId = req.session.user._id;
    }
    await Song.create(req.body);
    res.redirect('/songs');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// router.get('/:id', async (req, res) => {
//   try {
//     const song = await Song.findById(req.params.id).populate('userId');
//     res.render('songs/show.ejs', { song });
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// router.get('/:id/edit', async (req, res) => {
//   try {
//     const song = await Song.findById(req.params.id);
//     res.render('songs/edit.ejs', { song });
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     const song = await Song.findById(req.params.id);
//     if (!song) return res.redirect('/songs');

//     const ownerId = song.userId ? song.userId.toString() : null;
//     const sessionId = req.session && req.session.user ? req.session.user._id.toString() : null;

//     if (ownerId && sessionId && ownerId === sessionId) {
//       await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
//       res.redirect(`/songs/${req.params.id}`);
//     } else {
//       console.log('Permission denied');
//       res.redirect('/songs');
//     }
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// });

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
