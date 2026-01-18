# API Endpoints Reference

## Base URL
```
http://localhost:8080
```

## Authentication Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string",
  "displayName": "string"
}

Response (201):
{
  "accessToken": "jwt_token_here"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response (200):
{
  "accessToken": "jwt_token_here"
}
```

---

## User Profile Endpoints

### Get Current User Profile
```
GET /api/auth/me
Authorization: Bearer {accessToken}

Response (200):
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "displayName": "Test User",
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Chess enthusiast",
  "favorites": ["opening-1", "opening-2"],
  "gamesCount": 5,
  "latestSavedAt": "2024-01-06T10:30:00Z"
}
```

### Update User Profile
```
PUT /api/auth/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "displayName": "string",
  "avatarUrl": "string",
  "bio": "string",
  "email": "string"
}

Response (200):
{
  "id": 1,
  "username": "testuser",
  "email": "updated@example.com",
  "displayName": "Updated Name",
  "avatarUrl": "https://...",
  "bio": "Updated bio",
  "favorites": [],
  "gamesCount": 5,
  "latestSavedAt": "2024-01-06T10:30:00Z"
}
```

---

## Favorites Endpoints

### Add Favorite Opening
```
POST /api/auth/me/favorites
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "openingId": "opening-1"
}

Response (200):
[
  "opening-1",
  "opening-2"
]
```

### Remove Favorite Opening
```
DELETE /api/auth/me/favorites/{openingId}
Authorization: Bearer {accessToken}

Response (200):
[
  "opening-2"
]
```

---

## Game Endpoints

### Save Game
```
POST /api/games
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "My Game",
  "moves": "[\"e4\",\"e5\",\"Nf3\"]",
  "movesCount": 3
}

Response (200):
{
  "id": 1,
  "user": {...},
  "title": "My Game",
  "moves": "[\"e4\",\"e5\",\"Nf3\"]",
  "movesCount": 3,
  "savedAt": "2024-01-06T10:30:00Z"
}
```

### Get My Games
```
GET /api/games
Authorization: Bearer {accessToken}

Response (200):
[
  {
    "id": 1,
    "title": "Game 1",
    "moves": "[\"e4\",\"e5\"]",
    "movesCount": 2,
    "savedAt": "2024-01-06T09:00:00Z"
  },
  {
    "id": 2,
    "title": "Game 2",
    "moves": "[\"d4\",\"d5\"]",
    "movesCount": 2,
    "savedAt": "2024-01-06T10:00:00Z"
  }
]
```

---

## Profile Statistics Endpoint

### Get Profile with Statistics
```
GET /api/me/profile
Authorization: Bearer {accessToken}

Response (200):
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "displayName": "Test User",
  "avatarUrl": "https://...",
  "bio": "Chess enthusiast",
  "favorites": ["opening-1"],
  "gamesCount": 5,
  "latestSavedAt": "2024-01-06T10:30:00Z"
}
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Authentication

### Token Format
All authenticated requests must include the Authorization header:
```
Authorization: Bearer {jwt_token}
```

### Token Expiration
- Default: 24 hours
- Configurable in `application.yml` under `jwt.expiration-ms`

### Token Refresh
Currently, tokens are not refreshed. Users must login again after expiration.

---

## Error Responses

### Invalid Credentials
```json
{
  "error": "Invalid credentials"
}
```

### Missing Authorization
```json
{
  "error": "Authorization header missing"
}
```

### Invalid Token
```json
{
  "error": "Invalid or expired token"
}
```

### Username Already Exists
```json
{
  "error": "Username already taken"
}
```

---

## CORS Headers

The backend supports the following CORS headers:

```
Access-Control-Allow-Origin: http://localhost:5173, http://localhost:3000, http://localhost:5174
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

---

## Field Validation

### Username
- Required
- Unique
- No length restrictions (enforced by database)

### Password
- Required
- Hashed with BCrypt before storage
- Minimum 1 character (should enforce stronger requirement)

### Email
- Optional
- Valid email format recommended

### Display Name
- Optional
- Publicly visible

### Avatar URL
- Optional
- Should be valid image URL

### Bio
- Optional
- Can be markdown or plain text

### Opening ID
- String identifier
- Should match existing opening IDs in openings.json

---

## Rate Limiting
Currently, no rate limiting is implemented. Add later if needed.

---

## Pagination
Game endpoints currently return all games. Pagination can be added:
- `GET /api/games?page=0&size=20`

---

## Filtering
Game endpoints don't support filtering. Can be added:
- `GET /api/games?from=2024-01-01&to=2024-01-31`

---

## Sorting
Games are currently returned in descending order by `savedAt`.
Can be made configurable:
- `GET /api/games?sort=savedAt,desc`
