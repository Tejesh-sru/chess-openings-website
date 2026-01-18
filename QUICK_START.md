# Quick Start Guide - Chess Opening App

## 5-Minute Setup

### Prerequisites
- Java 17+ (`java -version`)
- Node.js 18+ (`node -v`)
- MySQL running (`mysql -u root -p`)

### Step 1: Create Database (30 seconds)
```bash
mysql -u root -p
CREATE DATABASE chessdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 2: Start Backend (2 minutes)
```bash
cd "java backend"
mvn clean install
mvn spring-boot:run
```
✅ Wait for "Started ChessBackendApplication" message
✅ Backend ready at `http://localhost:8080`

### Step 3: Start Frontend (1 minute)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend ready at `http://localhost:5173`

### Step 4: Test (1 minute)
1. Open `http://localhost:5173` in browser
2. Click "Login / Register"
3. Register with any test credentials
4. Click "Openings" to browse
5. Click "Play" to view board
6. Click "Profile" to see user info

**Done!** ✅

---

## Testing the Features

### Test 1: Register (30 seconds)
```
Email: test@example.com
Username: testuser
Password: password123
Display Name: Test User
Click: Register
```
Expected: App loads, shows username in header

### Test 2: Edit Profile (30 seconds)
```
Click: Profile tab
Click: Edit
Change: Display Name → "My Name"
Click: Save
```
Expected: Profile updates immediately

### Test 3: Save Favorite (30 seconds)
```
Click: Openings tab
Click: Load on any opening
Click: Play tab
Click: Save Favorite (in Controls)
Click: Profile tab
```
Expected: Opening appears in Favorites list

### Test 4: Play Chess (1 minute)
```
Click: Play tab
Drag pieces on board
Click: Flip (rotate board)
Click: Export PGN (copies moves)
```
Expected: Board works, moves recorded

### Test 5: Solve Puzzle (1 minute)
```
Click: Puzzles tab
Click: Start on any puzzle
Make moves shown in solution
```
Expected: Shows "Puzzle solved! ✅"

---

## Troubleshooting

### "Cannot connect to database"
```bash
# Check MySQL is running
mysql -u root -p
SHOW DATABASES;
# If chessdb doesn't exist, recreate it
CREATE DATABASE chessdb;
```

### "Backend not found" error in frontend
```bash
# Check backend is running
curl http://localhost:8080/health

# If not running, restart it:
cd "java backend"
mvn spring-boot:run
```

### "Port 8080 already in use"
```bash
# Kill process using port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :8080
kill -9 <PID>
```

### Frontend shows blank page
```bash
# Check .env file exists in frontend folder
cat frontend/.env

# Should show:
# VITE_API_BASE=http://localhost:8080

# Restart dev server:
cd frontend
npm run dev
```

### "Username already exists" error
```
Use a different username that hasn't been registered yet
Or delete the database and recreate it:
mysql -u root -p
DROP DATABASE chessdb;
CREATE DATABASE chessdb;
```

---

## Common Commands

```bash
# Restart everything
cd "java backend"
mvn spring-boot:run

# In another terminal:
cd frontend
npm run dev

# Test API with curl
curl http://localhost:8080/health

# Check database
mysql -u root -p
USE chessdb;
SELECT * FROM users;

# Clean rebuild backend
cd "java backend"
mvn clean install -DskipTests
mvn spring-boot:run

# Update frontend dependencies
cd frontend
npm update
```

---

## API Testing (Optional)

### Get JWT Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Response:
# {"accessToken":"eyJhbGciOiJIUzI1NiIs..."}
```

### Use Token to Access Profile
```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Feature Checklist

- ✅ User Registration
- ✅ User Login
- ✅ View Profile
- ✅ Edit Profile
- ✅ Save Favorites
- ✅ View Favorites
- ✅ Play Chess
- ✅ Save Games
- ✅ Solve Puzzles

---

## Files to Know About

```
chessopening/
├── frontend/               # React app
│   ├── src/
│   │   ├── context/AuthContext.jsx  # API calls
│   │   ├── components/              # UI components
│   │   └── App.jsx                  # Main app
│   ├── .env                         # API URL (VITE_API_BASE)
│   └── package.json
│
├── java backend/           # Spring Boot backend
│   ├── src/main/java/com/chessopening/
│   │   ├── controller/     # API endpoints
│   │   ├── model/          # Database entities
│   │   ├── service/        # Business logic
│   │   ├── config/         # Configuration
│   │   └── security/       # JWT & Auth
│   ├── src/main/resources/
│   │   ├── application.yml # Config (port, db)
│   │   └── db/migration/   # Database migrations
│   └── pom.xml            # Maven config
│
└── Documentation/
    ├── README_INTEGRATION.md      # Overview
    ├── INTEGRATION_COMPLETE.md    # Full guide
    ├── TESTING_GUIDE.md           # Testing
    ├── API_ENDPOINTS.md           # API reference
    └── INTEGRATION_CHECKLIST.md   # Checklist
```

---

## Success Indicators

✅ You're set up correctly when:
- Backend starts without errors
- Frontend loads without CORS errors
- Can register a new user
- JWT token is stored in browser localStorage
- API calls include Authorization header
- Profile updates persist after page reload

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Cannot find module 'react'" | Run `npm install` in frontend folder |
| "Port 3000 already in use" | Frontend uses 5173, not 3000 |
| "Unauthorized" on API calls | JWT token may be expired, register/login again |
| "CORS error" | Ensure backend is on port 8080 |
| "Database connection failed" | Create database or check MySQL credentials |

---

## Next Steps

1. ✅ Read INTEGRATION_COMPLETE.md for full details
2. ✅ Use TESTING_GUIDE.md for detailed testing
3. ✅ Check API_ENDPOINTS.md for API details
4. ✅ Customize the app for your needs

---

## Performance Tips

- Backend startup: ~10 seconds
- Frontend build: ~5 seconds
- Database initialization: ~2 seconds
- Total setup time: ~15-20 minutes

---

## Support

If something doesn't work:
1. Check the error message in console
2. See TESTING_GUIDE.md for solutions
3. Verify all services are running
4. Check `.env` and `application.yml` files
5. Review API_ENDPOINTS.md for endpoint details

---

**Ready to test!** 🎉

Open http://localhost:5173 in your browser and start playing chess!
