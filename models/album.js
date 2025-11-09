
const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    coverImg: {
        type: String,
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
    },
    songs: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;