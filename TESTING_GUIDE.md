# Integration Testing Guide

## Prerequisites
- Java 17+ installed
- Node.js 18+ installed
- MySQL database running on localhost:3306
- Database `chessdb` created

## Setup Steps

### 1. Database Setup
```sql
CREATE DATABASE chessdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup & Run
```bash
cd "java backend"
mvn clean install
mvn spring-boot:run
```
Backend will start on `http://localhost:8080`

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`

## Testing the Integration

### Test 1: Register New User
1. Open `http://localhost:5173` in browser
2. Click "Login / Register"
3. Enter registration details:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
   - Display Name: `Test User`
4. Click "Register"
5. Should redirect to app, showing logged-in state

### Test 2: Login with Existing User
1. Click "Logout" if currently logged in
2. Click "Login / Register"
3. Switch to Login mode
4. Enter credentials:
   - Username/Email: `testuser`
   - Password: `password123`
5. Should successfully login

### Test 3: View & Edit Profile
1. After login, click "Profile" tab
2. Should display:
   - Username: testuser
   - Email: test@example.com
   - Display Name: Test User
3. Click "Edit"
4. Change Display Name to "Updated User"
5. Click "Save"
6. Should update successfully

### Test 4: Save Favorite Opening
1. Go to "Openings" tab
2. Search for any opening (e.g., "Sicilian")
3. Click "Load" on an opening
4. Go to "Play" tab
5. In right panel "Controls", click "Save Favorite"
6. Should show success (check Profile to see favorites)

### Test 5: Save & Retrieve Games
1. In "Play" tab, make some moves on the board
2. In "GameControls", you should see options to save
3. Games are saved via `/api/games` endpoint
4. User's saved games are stored in database

### Test 6: Puzzle Mode
1. Go to "Puzzles" tab
2. Click "Start" on any puzzle
3. Follow the puzzle solution
4. Should show "Puzzle solved! ✅"

## API Testing with cURL

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "displayName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```
Response will contain `accessToken` - copy this for authenticated requests

### Get Profile (requires token)
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Save Game
```bash
curl -X POST http://localhost:8080/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "moves": "[\"e4\",\"e5\",\"Nf3\"]",
    "movesCount": 3,
    "title": "My Game"
  }'
```

### Get My Games
```bash
curl -X GET http://localhost:8080/api/games \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add Favorite
```bash
curl -X POST http://localhost:8080/api/auth/me/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "openingId": "opening-1"
  }'
```

## Troubleshooting

### CORS Error
- Ensure backend is running on port 8080
- Check SecurityConfig allows frontend origin
- Clear browser cache and try again

### Database Connection Error
- Ensure MySQL is running
- Check database exists: `SHOW DATABASES;`
- Verify credentials in `application.yml`

### JWT Token Invalid
- Tokens expire after 24 hours (configurable)
- Register/Login again to get new token
- Clear localStorage if token corrupted

### Frontend Can't Find Backend
- Check VITE_API_BASE in `.env`
- Should be `http://localhost:8080`
- Restart dev server after env changes

## Key Files to Check

- Backend: `java backend/src/main/java/com/chessopening/controller/`
- Frontend: `frontend/src/context/AuthContext.jsx`
- Configuration: 
  - Backend: `java backend/src/main/resources/application.yml`
  - Frontend: `frontend/.env`
