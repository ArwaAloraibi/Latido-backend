const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require("cors");
const app = express();
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const PORT = process.env.PORT || 3000;

// Controllers
const testJwtRouter = require('./controllers/test-jwt');
const authCtrl = require('./controllers/auth');
const usersCtrl = require('./controllers/users');
const playlistRoutes = require('./controllers/playlists');
const albumsCtrl = require('./controllers/albums');
const songsCtrl = require('./controllers/songs');

// MiddleWare
const verifyToken = require('./middleware/verify-token');

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public
app.use('/auth', authCtrl);
app.use('/test-jwt', testJwtRouter);

// Protected Routes
app.use(verifyToken);
app.use('/users', usersCtrl);
app.use('/playlists', playlistRoutes);
app.use('/albums', albumsCtrl);
app.use('/songs', songsCtrl);

app.listen(PORT, () => {
  console.log('The express app is ready!');
});
