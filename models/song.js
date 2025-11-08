
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    coverImg: {
        type: String,
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;