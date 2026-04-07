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

Built with a **botanical / cozy reading sanctuary** aesthetic, it's a personal space to track every book you've opened, every page you've turned, every quote that stopped you cold.

No ads. No social feed. No algorithm. Just you and your books.

---

## 🌿 Features

| Feature | Description |
|---|---|
| 📖 **Book Library** | Add books with cover art, genre, total pages, and live reading progress |
| 🔥 **Reading Streaks** | Duolingo-style daily streak system — global and per-book |
| 📊 **Monthly Stats** | Reading sessions tracked over time, visualized in your stats dashboard |
| 💬 **Quotes & Notes** | Capture quotes and personal notes directly on each book card |
| 🎨 **Cozy UI** | Playfair Display headings, botanical accents, warm card-based layout |
| ⚡ **Fast & Reactive** | Zero frameworks — pure ES2022 vanilla JS with async/await fetch calls |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────┐
│                   FRONTEND                  │
│   Vanilla JS (ES Modules) · HTML5 · CSS3    │
│   Google Fonts: Playfair Display, DM Sans,  │
│              Cormorant Garamond             │
├─────────────────────────────────────────────┤
│                   BACKEND                   │
│     FastAPI (Python) · Pydantic Models      │
│     Gunicorn + UvicornWorker (ASGI)         │
├─────────────────────────────────────────────┤
│                  DATABASE                   │
│     PostgreSQL · psycopg2 · Row Mapping     │
│     Safe migrations via ALTER TABLE IF NOT  │
│              EXISTS pattern                 │
├─────────────────────────────────────────────┤
│                 DEPLOYMENT                  │
│   Render Free Tier · python-dotenv · CORS   │
│        UptimeRobot keep-alive pings         │
└─────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
bibliotheca/
│
├── main.py              # FastAPI app, all route handlers
├── db.py                # PostgreSQL init, row_to_book deserialization
├── static/
│   ├── index.html       # App shell
│   ├── script.js        # All frontend logic (ES Modules)
│   └── style.css        # Botanical aesthetic styles
└── .env                 # DATABASE_URL and secrets (not committed)
```

---

## 🚀 Running Locally

**1. Clone & install dependencies**
```bash
git clone https://github.com/yourname/bibliotheca.git
cd bibliotheca
pip install -r requirements.txt
```

**2. Set up your environment**
```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/bibliotheca
```

**3. Start the server**
```bash
gunicorn main:app -w 1 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**4. Open `static/index.html` in your browser** — or serve it via FastAPI's `StaticFiles` mount.

---

## 🗃️ Database Schema

```sql
-- Books
CREATE TABLE books (
    id            SERIAL PRIMARY KEY,
    title         TEXT,
    author        TEXT,
    cover_url     TEXT,
    genre         TEXT,
    current_page  INTEGER DEFAULT 0,
    total_pages   INTEGER,
    streak_count  INTEGER DEFAULT 0,
    last_read_date DATE,
    quotes        TEXT[],
    notes         TEXT
);

-- Global Streak
CREATE TABLE user_streak (
    id              SERIAL PRIMARY KEY,
    streak_count    INTEGER DEFAULT 0,
    last_read_date  DATE
);

-- Reading Sessions (for monthly stats)
CREATE TABLE reading_sessions (
    id         SERIAL PRIMARY KEY,
    book_id    INTEGER REFERENCES books(id),
    date       DATE,
    pages_read INTEGER
);
```

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/books` | Fetch all books |
| `POST` | `/books` | Add a new book |
| `PATCH` | `/books/{id}` | Update reading progress |
| `DELETE` | `/books/{id}` | Remove a book |
| `GET` | `/stats` | Monthly reading statistics |
| `POST` | `/session` | Log a reading session |

---

## 🔥 Streak Logic

The streak system follows four precise cases:

```
1. First read ever        → initialize streak to 1
2. Already read today     → frozen (idempotent, no double-count)
3. Read yesterday         → increment streak
4. Gap of 2+ days         → reset streak to 1
```

The global `user_streak` table follow this logic, with `update_global_streak()` guarded against same-day double-counting.

---

## 🌱 Design Philosophy

> *"A reader lives a thousand lives before he dies. The man who never reads lives only one."*

This app was built with **zero over-engineering** as a guiding principle:

- No React. No Redux. No ORM. No migrations framework.
- DOM is constructed via `createElement` + `textContent` — never `innerHTML` interpolation — to handle book titles with special characters safely.
- Schema changes use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for safe, crash-free redeploys on Render.
- All fetch calls use relative paths — no hardcoded localhost URLs in production.

---

## ☁️ Deployment Notes

Deployed on **Render Free Tier** — which spins down after 15 minutes of inactivity.

A keep-alive cron via [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org) pings an existing `GET` endpoint every 14 minutes. No new endpoint needed.

---

<div align="center">

*Built with patience, chai, and too many late nights.*

**🌿 Happy Reading 🌿**

</div>
