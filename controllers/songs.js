const express = require('express');
const router = express.Router();

const Song = require('../models/song');
const Album = require('../models/album');


router.get('/new', (req, res) => {
  res.json({ message: 'Render new song form' });
});


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
router.delete('/:id', async (req, res) => {

try {
    const song = await Song.findById(req.params.id);
    console.log(song)
    if (!song) return res.status(404).json({ err: 'Song not found' });
 
    // authorization check
    if (req.user && song.artist && song.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ err: 'Not authorized to delete this song' });
    }
    // remove song reference from its album 
    if (song.album) {
      await Album.findByIdAndUpdate(song.album, {
         $pull: { songs: song._id } 
        });
    }

    // delete the song itself
    await Song.findByIdAndDelete(song._id);

    return res.status(204).json({message: 'Song deleted'})

    }catch (err) {
      res.status(500).json({ err: err.message });
    }

});

module.exports = router;
