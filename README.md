# BookHabits Tracking App 
📚 Book Tracker Web App

A simple full-stack web application to track your reading progress, save notes, and store meaningful quotes from books.

🧠 Features
➕ Add new books
📖 Track reading progress (pages read)
📊 Visual progress bar
💬 Save up to 5 quotes per book
📝 Write personal notes (up to 500 words)
🔄 Real-time updates using API
🛠 Tech Stack
Frontend
HTML
CSS
JavaScript (Vanilla)
Backend
Python (FastAPI)
Database
SQLite (built-in with Python)
📁 Project Structure
book-tracker/

backend/
    main.py          # FastAPI routes & logic
    database.py      # Database setup
    books.db         # SQLite database (auto-created)

frontend/
    index.html       # UI layout
    style.css        # Styling
    script.js        # Frontend logic

requirements.txt
⚙️ How It Works
Backend (FastAPI)
Handles API requests
Connects to SQLite database
Stores books, quotes, and notes

Key endpoints:

GET /books → fetch all books
POST /books → add a book
PATCH /books/{id} → update progress
PATCH /books/{id}/quotes → update quotes
PATCH /books/{id}/notes → update notes
Database

Created automatically using:

Neon.db

Table structure:

Column	Type
id	INTEGER
title	TEXT
total_pages	INTEGER
current_page	INTEGER
quotes	TEXT (JSON)
notes	TEXT
author  TEXT 
Frontend
Fetches data from backend using fetch()
Dynamically renders book cards
Handles modals for:
Adding books
Quotes
Notes

Example API call:

fetch("/books")
🚀 Running the Project
1. Install dependencies
pip install fastapi uvicorn
🌐 Future Improvements
User authentication (login system)
Dark mode 🌙
Reading statistics
Book cover images
Search & filter books
Deployment (Railway)
📌 Notes
SQLite requires no manual installation
Database file (books.db) is created automatically
Backend must be running for frontend to work
🧠 Developer Insight

This project demonstrates:

Full-stack development
API integration
Database handling
Dynamic UI rendering
🚀 Deployment Plan
Cursor / PyCharm
        ↓
GitHub
        ↓
Render
        ↓
Live App 🌍

If you want next step 👇
I can:

Review your code and say “Phase-1 complete or not”
Or help you write a killer GitHub description + portfolio version 😏
