# ♟️ Chess Openings Website

<div align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-darkgreen?logo=mongodb)
![Python](https://img.shields.io/badge/Python-AI_Service-yellow?logo=python)
![License](https://img.shields.io/badge/License-MIT-blue)

An AI-powered Chess Openings Learning Platform built using the MERN Stack with Python-based Chess Analysis.

</div>

---

# 📖 Overview

Chess Openings Website is a modern web application designed to help chess players learn, practice, and analyze chess openings.

The platform provides:

- 📚 Opening Explorer
- ♟ Interactive Chess Board
- 🤖 AI Opening Analysis
- 📈 Move Evaluation
- ⭐ Favorite Openings
- 🔍 Search Openings
- 👤 User Authentication
- 📊 Opening Statistics

The project follows a **Microservice Architecture**, where the AI engine runs independently from the main backend.

---

# 🏗 Architecture

```
                    React Frontend
                          │
                          │ REST API
                          ▼
                Node.js + Express Backend
                          │
        ┌─────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
  MongoDB Database                  Python AI Service
                                            │
                                            ▼
                                   Chess Engine Analysis
```

---

# 🚀 Features

### Authentication

- User Registration
- Login
- JWT Authentication
- Protected Routes

### Chess Openings

- Search Openings
- ECO Codes
- Opening Details
- Move Sequences
- Variations

### AI Features

- Best Move Suggestions
- Position Evaluation
- Opening Classification
- Move Accuracy Analysis

### User Features

- Save Favorite Openings
- Opening History
- Personal Dashboard
- User Profile

---

# 🛠 Tech Stack

## Frontend

- React
- React Router
- Axios
- CSS
- JavaScript

## Backend

- Node.js
- Express.js
- JWT Authentication
- REST APIs

## Database

- MongoDB
- Mongoose

## AI Service

- Python
- python-chess
- Stockfish (Optional)

---

# 📂 Project Structure

```
Chess-Openings-Website
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── mern-backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   └── server.js
│
├── python-services
│   ├── chess_analysis.py
│   ├── opening_classifier.py
│   └── requirements.txt
│
└── README.md
```

---

# 🔄 Workflow

```
User

   │

   ▼

React Frontend

   │

REST API

   ▼

Express Backend

   │

MongoDB

   │

Python AI Service

   │

Chess Analysis

   │

Response

   ▼

Frontend UI
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/chess-openings-website.git

cd chess-openings-website
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

Runs on:

```
http://localhost:3000
```

---

## Backend Setup

```bash
cd mern-backend

npm install

npm run dev
```

Runs on:

```
http://localhost:5000
```

---

## Python AI Service

```bash
cd python-services

pip install -r requirements.txt

python app.py
```

Runs on:

```
http://localhost:8000
```

---

# 🔑 Environment Variables

## Backend (.env)

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

PYTHON_SERVICE=http://localhost:8000
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|----------|----------------|
| POST | /api/auth/register |
| POST | /api/auth/login |

---

## Openings

| Method | Endpoint |
|----------|----------------|
| GET | /api/openings |
| GET | /api/openings/:id |
| GET | /api/openings/search |

---

## AI

| Method | Endpoint |
|----------|----------------|
| POST | /api/ai/analyze |
| POST | /api/ai/bestmove |
| POST | /api/ai/evaluate |

---

# 📸 Screenshots

> Add screenshots of:

- Home Page
- Chess Board
- Opening Explorer
- Analysis Page
- Dashboard

---

# 🎯 Future Enhancements

- Multiplayer Chess
- Live Engine Analysis
- Puzzle Trainer
- Opening Recommendations
- Elo Rating System
- Chess Coach AI
- PGN Upload
- Lichess Integration
- Chess.com Integration

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Create a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Jakkula Tejesh**

- GitHub: https://github.com/Tejesh-sru
- LinkedIn: *(Add your LinkedIn URL)*

---

⭐ If you like this project, don't forget to give it a Star!
