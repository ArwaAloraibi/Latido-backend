# Latido - Backend API

This is the backend repository for **Latido**, a music streaming platform. The backend provides RESTful API endpoints for user authentication, album management, playlist operations, and file uploads.

For more details about the project, features, and frontend implementation, please visit the [Frontend Repository](https://github.com/ArwaAloraibi/Latido-frontEnd).

## 🎵 Project Name

**Latido** - Music Streaming Platform Backend

## 📋 Overview

The Latido backend is built with Node.js and Express, providing a robust API for the music streaming application. It handles user authentication, CRUD operations for albums and playlists, file uploads for MP3s and images, and manages the MongoDB database.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn (multer included)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash / ubuntu
git clone <backend-repository-url>
cd Latido-backEnd
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:3000/latido
JWT_SECRET=your-secret-key-for-jwt
VITE_BACK_END_SERVER_URL=http://localhost:3000
```

4. Start the server:
```ubuntu / bash
npm start
# or for development
npm run dev
```

The API will be available at `http://localhost:3000`

## 📁 Project Structure

```
Latido-backEnd/
├── controllers/           # Route controllers
│   ├── albums.js          # Album CRUD operations
│   ├── playlists.js       # Playlist CRUD operations
│   ├── songs.js           # Song operations
│   ├── users.js           # User operations
│   ├── auth.js            # Authentication
│   └── test-jwt.js        # JWT testing route
├── models/                # Mongoose models
│   ├── album.js
│   ├── playlist.js
│   ├── song.js
│   └── user.js
├── middleware/            # Custom middleware
│   ├── upload.js          # Multer file upload configuration
│   └── auth.js            # JWT authentication middleware
├── uploads/               # Uploaded files directory
│   ├── audio/             # MP3 files
│   ├── images/            # Image files
│   └── misc/              # Other files
├── .gitignore             # Ignored files and directories for Git
├── server.js              # Server entry point
└── package.json           # Dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/sign-up` - User registration
- `POST /auth/sign-in` - User login

### Albums
- `GET /albums` - Get all albums (populated with songs and userId)
- `GET /albums/:albumId` - Get album songs
- `POST /albums` - Create new album (with file uploads)
- `PUT /albums/:albumId` - Update album (with optional file uploads)
- `DELETE /albums/:albumId` - Delete album

### Playlists
- `GET /playlists` - Get all playlists (populated)
- `GET /playlists/:id` - Get specific playlist
- `POST /playlists` - Create new playlist (with optional cover image)
- `PUT /playlists/:id` - Update playlist (with optional cover image)
- `DELETE /playlists/:id` - Delete playlist

### Songs
- `GET /songs/:id` - Get specific song
- `DELETE /songs/:id` - Delete song

### Users
- `GET /users` - Get all users
- `GET /users/current-user` - Get current authenticated user
- `GET /users/:id` - Get user by ID
- `GET /users/:id/features` - Get user features based on role

## 📤 File Uploads

The backend supports file uploads using Multer:

- **Album Cover Images**: Uploaded to `uploads/images/`
- **Song MP3 Files**: Uploaded to `uploads/audio/`
- **Song Cover Images**: Uploaded to `uploads/images/`
- **Playlist Cover Images**: Uploaded to `uploads/images/`

### File Upload Endpoints

- `POST /albums` - Accepts FormData with:
  - `coverImg` - Album cover image
  - `songName_0`, `songName_1`, etc. - Song names
  - `songMP3_0`, `songMP3_1`, etc. - MP3 files
  - `songCoverImg_0`, `songCoverImg_1`, etc. - Song cover images (optional)

- `POST /playlists` - Accepts FormData with:
  - `coverImg` - Playlist cover image (optional)
  - `name` - Playlist name
  - `songs` - Array of song IDs

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

- Tokens are included in the `Authorization` header: `Bearer <token>`
- Token payload includes: `_id`, `username`, and `roles`
- Protected routes require valid authentication

## 🗄️ Database Models

### User
- `username` (String, required)
- `hashedPassword` (String, required)
- `pfp` (String, optional)
- `roles` (String, enum: 'listener' | 'artist', required)
- `albums` (Array of ObjectIds, ref: 'Album')
- `playlists` (Array of ObjectIds, ref: 'Playlist')

### Album
- `name` (String, required)
- `coverImg` (String, optional)
- `songs` (Array of ObjectIds, ref: 'Song')
- `userId` (ObjectId, ref: 'User')

### Playlist
- `listener` (ObjectId, ref: 'User', required)
- `songs` (Array of ObjectIds, ref: 'Song', required)
- `name` (String, required)
- `totalDuration` (Number, required)
- `coverImg` (String, optional)

### Song
- `name` (String, required)
- `duration` (Number, required)
- `coverImg` (String, optional)
- `audioUrl` (String, optional)
- `album` (ObjectId, ref: 'Album')
- `artist` (ObjectId, ref: 'User')

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Multer** - File upload handling
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management

## 📝 Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:3000/latido
JWT_SECRET=your-secret-key-for-jwt
VITE_BACK_END_SERVER_URL=http://localhost:3000
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- File type validation for uploads
- File size limits
- Authorization checks for resource access

## 📦 Dependencies

Key dependencies:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `multer` - File upload middleware
- `jsonwebtoken` - JWT handling
- `bcrypt` - Password hashing
- `dotenv` - Environment configuration

## 🚧 Development Notes

- Static files are served from the `uploads/` directory
- File URLs are generated relative to the base URL
- All file uploads are validated for type and size
- CORS is configured for frontend communication

---

**Frontend Repository**: https://github.com/ArwaAloraibi/Latido-frontEnd