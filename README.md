# ♟️ Chess Openings Explorer

A full-stack **Chess Openings & Game Management Platform** that enables users to explore chess openings, save games, manage favorite openings, and maintain a personalized chess profile.  
Built using **React and Spring Boot** with **JWT-based authentication** and a **MySQL database**.

---

## 🚀 Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- User registration and login
- Stateless session handling using Authorization headers
- Editable user profile (display name, avatar, bio, email)

### ♟️ Chess Features
- Explore chess openings
- Save played games
- Mark and manage favorite openings
- View saved games with timestamps and move counts

### 👤 Profile & Statistics
- User profile with:
  - Total saved games
  - Favorite openings
- Profile editing functionality
- Persistent data storage

---

## 🛠️ Tech Stack

### Frontend
- HTML5  
- CSS3 (Bootstrap)  
- JavaScript (ES6+)  
- React  
- Vite  

### Backend
- Java  
- Spring Boot  
- Spring Security  
- JWT Authentication  

### Database & Tools
- MySQL  
- Flyway (Database Migrations)  
- Postman (API Testing)  
- Maven  

---

## 🧩 System Architecture
React Frontend → Spring Boot REST API → MySQL Database


---

## 🔄 Frontend & Backend Integration Summary

### Backend (Spring Boot)

#### ✅ CORS Configuration
- Allowed frontend origins:
  - http://localhost:3000
  - http://localhost:5173
  - http://localhost:5174
- Allows all HTTP methods
- Allows Authorization headers
- Credentials enabled
- Max age: 1 hour

#### 🔐 Authentication System
- JWT-based stateless authentication
- Token format:


#### Controllers
- AuthController
- UserController
- GameController
- ProfileController

#### AuthResponse
- Returns `accessToken` field

#### 👤 User Model Enhancements
- email
- displayName
- avatarUrl
- bio
- favorites (stored as JSON)

#### Database Migrations
- V3__add_user_profile_fields.sql
- V4__add_favorites.sql

#### ♟️ Game Endpoints
- Save games per user
- Retrieve saved games
- Stores move count and save timestamp

---

### Frontend (React)

#### 🔧 Environment Configuration


#### 🔑 Authentication Context
- JWT stored in localStorage as `chess_token`
- Automatically fetches user profile after login/register
- All API requests include Authorization header

#### Supported Methods
- login
- register
- logout
- updateProfile
- addFavorite
- removeFavorite
- saveGame
- getGames
- getProfile

#### UI Components
- LoginRegister – handles login and registration
- Profile – displays and edits user profile
- GameControls – save games and manage favorites

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|------|---------|-------------|
| POST | /api/auth/login | Login user |
| POST | /api/auth/register | Register new user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/me | Update user profile |

### Favorites
| Method | Endpoint | Description |
|------|---------|-------------|
| POST | /api/auth/me/favorites | Add favorite opening |
| DELETE | /api/auth/me/favorites/{openingId} | Remove favorite |

### Games & Profile
| Method | Endpoint | Description |
|------|---------|-------------|
| POST | /api/games | Save a game |
| GET | /api/games | Get user games |
| GET | /api/me/profile | Profile with statistics |

---

## ▶️ How to Run the Project

### Backend Setup
```bash
cd "java backend"
mvn spring-boot:run

### Frontend Setup

cd frontend
npm install
npm run dev
