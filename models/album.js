
const albumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
 
    },
    coverImg: {
        type:true,
    },
      albumId:{
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'album'

      },
      song:{
        type:mongoose.Schema
.Types.ObjectId, ref: 'Song'
      }

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});


const song = mongoose.model("album", albumSchema);



module.exports = album;