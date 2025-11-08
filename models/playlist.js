const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
  playlist_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
  }],
  name: {
    type: String,
    required: true,
  },
  totalDuration: {
    type: Number,
    required: true,
  },
});

playlistSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v;
  },
});

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
