const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  pfp: {
    type: String,
  },
  roles: {
    type: String,
    enum:['listiner', 'artist'],
    required: true,
  },
  albums: {
    type:mongoose.Schema.Types.ObjectId, ref: 'album'
  },
  
  playlists: {
    type:mongoose.Schema.Types.ObjectId, ref: 'plsylist' 
},

});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
