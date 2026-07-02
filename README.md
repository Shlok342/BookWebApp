<div align="center">

# 📚 Bibliotheca

### *A personal reading sanctuary — built from scratch, one page at a time.*

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

</div>

---

## ✨ What is this?

**Bibliotheca** is a full-stack reading tracker designed around one idea: your reading life deserves more than a spreadsheet.

Built with a **botanical / cozy reading sanctuary** aesthetic, it's a personal space to track every book you've opened, every page you've turned, and every quote that stopped you cold. Each user gets their own private library — sign up, log in, and your books stay yours.

No ads. No social feed. No algorithm. Just you and your books.

---

## 🌿 Features

| Feature | Description |
|---|---|
| 🔐 **User Accounts** | Register and log in — your library, streaks, and stats are tied to your account |
| 📖 **Book Library** | Add books with cover art, genre, total pages, and live reading progress |
| 🔥 **Reading Streaks** | Duolingo-style daily streaks — global and per-book, with streak freezes for missed days |
| 📊 **Monthly Stats** | Reading sessions tracked over time, visualized in your stats dashboard |
| 📅 **Reading Activity Heatmap** | A GitHub-style heatmap of your reading history with custom tooltips and colour-coded intensity |
| 🏆 **Reading Challenges** | Unlock poetic milestones — first book finished, 7-day streak, 500 pages read, and more |
| 🏷️ **Tags** | Colourful tags with whimsical names — one for every mood and occasion |
| 💬 **Quotes & Notes** | Capture quotes and personal notes directly on each book card |
| 🌙 **Dark Mode** | Toggle between the warm botanical theme and a moody dark palette |
| 🎨 **Cozy UI** | Playfair Display headings, botanical accents, warm card-based layout |
| ⚡ **Fast & Reactive** | No frontend framework — modular vanilla JS with async fetch calls |

---

## 🛠️ Tech Stack

| Layer | Tools |
|---|---|
| **Frontend** | Vanilla JS (ES Modules), HTML5, SCSS, Jinja2 templates |
| **Backend** | FastAPI, Pydantic, service-layer architecture |
| **Database** | PostgreSQL with SQLAlchemy models and Alembic migrations |
| **Auth** | JWT tokens, bcrypt password hashing, rate-limited login |
| **Fonts** | Playfair Display, DM Sans, Cormorant Garamond, Great Vibes |
| **Deployment** | Render (free tier), python-dotenv, CORS |

---

## 🗂️ Project Structure

```
BookWebApp/
│
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # DB initialisation and seed data
│   ├── auth/                    # JWT utilities
│   ├── routers/                 # API route handlers (books, stats, streak, heatmap, auth…)
│   ├── backend_services/        # Business logic (streaks, stats, challenges, heatmap…)
│   ├── schemas/                 # Pydantic request/response models
│   ├── database_dir/            # SQLAlchemy models
│   ├── db/                      # Database queries and user management
│   └── static/
│       ├── templates/           # Jinja2 HTML (index, modals, navbar)
│       ├── css/                 # SCSS source and compiled styles
│       ├── api_service/         # Frontend API client
│       ├── auth/                # Login/register UI logic
│       ├── heatmap/             # Activity heatmap rendering
│       ├── modal_helper/        # Stats, quotes, notes, tags, challenges modals
│       ├── render_helpers/      # Book card and library UI builders
│       └── main.js              # App bootstrap
│
├── alembic/                     # Database migration scripts
├── alembic.ini
├── requirements.txt
└── README.md
```

---

## 🚀 Getting Started

1. **Clone the repo** and create a virtual environment.
2. **Install dependencies:** `pip install -r requirements.txt`
3. **Set up environment variables** in `backend/.env`:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `ALLOWED_ORIGINS` — comma-separated frontend origins (for CORS)
4. **Run the server** from the project root:
   ```
   uvicorn backend.main:app --reload
   ```
5. Open `http://localhost:8000` in your browser.

The database tables are created automatically on first startup. Alembic is available for schema migrations when needed.

---

## 🗃️ What Gets Stored

Each user account owns its own books, reading sessions, streaks, and challenge progress. The main data includes:

- **Books** — title, author, cover, genre, page progress, quotes, notes, and tags
- **Reading sessions** — pages read per day, used for stats and the heatmap
- **Streaks** — global reading streak with freeze tokens for occasional missed days
- **Challenges** — milestone tracking (books finished, pages read, streak length, library size)

---

## 📡 API Overview

All book and stats endpoints require a valid JWT (obtained via `/auth/login` or `/auth/register`).

| Area | Routes | Purpose |
|---|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login` | Create an account or sign in |
| **Books** | `GET/POST /books`, `PATCH/DELETE /books/{id}` | Manage your library and update progress |
| **Book details** | `PATCH /books/{id}/quotes`, `/notes`, `/tags` | Edit quotes, notes, and tags on a book |
| **Stats & activity** | `GET /stats`, `/streak`, `/heatmap` | Monthly stats, streak status, and heatmap data |
| **Extras** | `GET /challenges`, `/quote` | Reading milestones and a daily quote |
| **Health** | `GET /healthz` | Deployment health check |

---

## 🔥 Streak Logic

Reading streaks reward consistency without punishing a single bad day:

- Read today for the first time → streak starts or continues
- Already logged reading today → no double-counting
- Read yesterday → streak increments
- Miss one day → a **streak freeze** is used automatically (if you have any left)
- Miss two or more days without a freeze → streak resets

---

## 🌱 Design Philosophy

> *"A reader lives a thousand lives before he dies. The man who never reads lives only one."*

This app was built with **simplicity and intention** as guiding principles:

- No React, no Redux — the frontend is plain JS modules that talk to a clean REST API.
- The backend is organised into routers and services, keeping route handlers thin and logic testable.
- User data is isolated per account; nothing is shared across libraries.
- The UI is built with safe DOM construction and Jinja2 templates — no fragile string interpolation.
- Schema changes are handled through SQLAlchemy and Alembic for safe, repeatable migrations.

---

## ☁️ Deployment Notes

Deployed on **Render Free Tier** — which spins down after 15 minutes of inactivity.

A keep-alive cron via [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org) pings the `/healthz` endpoint every 14 minutes to keep the instance warm.

---

<div align="center">

*Built with patience, chai, and too many late nights.*

**🌿 Happy Reading 🌿**

</div>
