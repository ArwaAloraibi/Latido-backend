const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;
    
    if (file.fieldname.includes('MP3') || file.fieldname.includes('mp3')) {
      uploadPath = path.join(uploadsDir, 'audio');
    } else if (file.fieldname.includes('coverImg') || file.fieldname.includes('CoverImg')) {
      uploadPath = path.join(uploadsDir, 'images');
    } else {
      uploadPath = path.join(uploadsDir, 'misc');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
  // Allow audio files
  else if (file.mimetype.startsWith('audio/') || file.originalname.endsWith('.mp3')) {
    cb(null, true);
  }
  // Reject other files
  else {
    cb(new Error('Invalid file type. Only images and audio files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
