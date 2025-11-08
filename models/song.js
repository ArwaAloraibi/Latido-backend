
const songSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required:true,
    },
    coverImg: {
        type:true,
    },
      albumId:{
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'album'

      },
 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

const song = mongoose.model("song", songSchema);



module.exports = song;