const mongoose = require('mongoose');

const albumSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  hashedPassword: {
    type: String,
    require: true,
  },
  pfp: {
    type: String,
  },
  isArtist: {
    type: Boolean,
  }
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
