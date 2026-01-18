# Frontend & Backend Integration Summary

## Overview
Connected the React frontend with the Java Spring Boot backend with proper authentication, CORS, and API endpoints.

## Key Changes Made

### Backend (Java Spring Boot)

#### 1. **CORS Configuration** (`SecurityConfig.java`)
   - Added CORS support for frontend origins (localhost:3000, 5173, 5174)
   - Allows all HTTP methods and Authorization headers
   - Credentials enabled with 1-hour max age

#### 2. **Authentication System**
   - **AuthController**: Handles `/api/auth/login` endpoint
   - **UserController**: 
     - `POST /api/auth/register` - Creates new user and returns JWT token
     - `GET /api/auth/me` - Returns logged-in user profile
     - `PUT /api/auth/me` - Updates user profile (displayName, avatarUrl, bio, email)
     - `POST /api/auth/me/favorites` - Adds opening to favorites
     - `DELETE /api/auth/me/favorites/{openingId}` - Removes favorite
   - Uses JWT tokens stored in Authorization header (`Bearer <token>`)
   - AuthResponse now returns `accessToken` field (was `token`)

#### 3. **User Model Updates**
   - Added fields: `email`, `displayName`, `avatarUrl`, `bio`, `favorites` (JSON)
   - Database migrations:
     - `V3__add_user_profile_fields.sql` - Adds profile columns
     - `V4__add_favorites.sql` - Adds favorites column

#### 4. **Game Endpoints** (`GameController.java`)
   - `POST /api/games` - Save a game (requires authentication)
   - `GET /api/games` - List user's saved games
   - Includes move count and save timestamp

#### 5. **Profile Controller** (`ProfileController.java`)
   - `GET /api/me/profile` - Gets user profile with game statistics

#### 6. **DTOs Created/Updated**
   - `UserProfileDTO` - Complete user profile with games count and favorite openings
   - `AuthResponse` - Returns JWT accessToken
   - Updated `User` model to include profile fields

### Frontend (React)

#### 1. **Environment Configuration** (`.env`)
   - `VITE_API_BASE=http://localhost:8080`
   - API base URL configurable via environment

#### 2. **Authentication Context** (`AuthContext.jsx`)
   - Fixed `login()` to send `username` instead of `who` to backend
   - Stores JWT token in localStorage under `chess_token` key
   - Calls `/api/me` after login/register to fetch user profile
   - Methods: `login()`, `register()`, `logout()`, `addFavorite()`, `removeFavorite()`, `updateProfile()`, `saveGame()`, `getGames()`, `getProfile()`
   - All requests include Authorization header with JWT token

#### 3. **Login/Register Component** (`LoginRegister.jsx`)
   - Sends credentials to `/api/auth/login` and `/api/auth/register`
   - Handles registration with email, username, password, displayName

#### 4. **Profile Component** (`Profile.jsx`)
   - Displays user profile information
   - Shows saved favorites
   - Can edit profile (displayName, avatarUrl, bio)
   - Calls `updateProfile()` to save changes

#### 5. **Game Controls** (`GameControls.jsx`)
   - Can save favorite openings
   - Calls `addFavorite()` endpoint

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/register` - Register new account
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Favorites
- `POST /api/auth/me/favorites` - Add favorite opening
- `DELETE /api/auth/me/favorites/{openingId}` - Remove favorite

### Games
- `POST /api/games` - Save a game
- `GET /api/games` - List user's games
- `GET /api/me/profile` - Get profile with statistics

## How to Use

### Starting the Backend
```bash
cd "java backend"
mvn spring-boot:run
# Server runs on http://localhost:8080
```

### Starting the Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Testing Authentication Flow
1. Click "Login / Register" button
2. Register with: email, username, password, displayName
3. Backend returns JWT token
4. Frontend stores token and fetches user profile
5. User can now save games and manage favorites

## Database Setup
Ensure MySQL is running and create the database:
```sql
CREATE DATABASE chessdb;
```

The application will automatically run migrations (V1, V2, V3, V4) via Flyway.

## Environment Variables
- Backend: `jwt.secret` and `jwt.expiration-ms` in `application.yml`
- Frontend: `VITE_API_BASE` in `.env`

## Security Notes
- Passwords are hashed with BCrypt
- JWT tokens have 24-hour expiration (configurable)
- CORS restricted to specified frontend origins
- All authenticated endpoints require valid JWT token
- CSRF disabled (stateless JWT auth)
