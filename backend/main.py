import os
import json
import asyncio
import urllib.request
from pathlib import Path
from contextlib import contextmanager
from datetime import date
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
from backend.services.book_services import update_progress_service

BASE_DIR = Path(__file__).resolve().parent
# Ensure environment variables are loaded from `backend/.env` regardless of CWD.
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))
class PageUpdate(BaseModel):
    current_page: int
from backend.database import init_db, get_connection
app=FastAPI()
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return FileResponse(BASE_DIR / "static" / "index.html")
class Book(BaseModel):
    title: str
    author: str = ""
    total_pages: int
    current_page: int = 0
    genre: str = ""
    cover_url: str = ""
# ─── DB HELPER ───────────────────────────────────────────────────────────────
@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()

def row_to_book(row):
    return {
        "id":             row[0],
        "title":          row[1],
        "author":         row[2] if row[2] else "",
        "total_pages":    row[3],
        "current_page":   row[4],
        "quotes":         json.loads(row[5]) if row[5] else [],
        "notes":          row[6] if row[6] else "",
        "last_read_date": str(row[7]) if row[7] else None,
        "streak_count":   row[8] if row[8] else 0,
        "created_at":     str(row[9]) if row[9] else None,
        "genre":          row[10] if row[10] else "",
        "cover_url":      row[11] if row[11] else ""
    }

# ─── GET ALL BOOKS ───────────────────────────────────────────────────────────
@app.get("/books")
def get_books():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, author, total_pages, current_page, quotes, notes, last_read_date, streak_count, created_at, genre,  cover_url FROM books"
        )
        rows = cursor.fetchall()
    return [row_to_book(row) for row in rows]

@app.post("/books")
def add_book(book: Book):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO books (title, author, total_pages, current_page, genre, cover_url)
            VALUES (%s, %s, %s, 0, %s, %s)
            """,
            (book.title, book.author, book.total_pages, book.genre, book.cover_url)
        )
        conn.commit()
    return {"message": "Book added"}

# ─── GET SINGLE BOOK ─────────────────────────────────────────────────────────

@app.patch("/books/{book_id}")
def update_progress(book_id: int, update: PageUpdate):
    return update_progress_service(book_id, update)
        

# ─── GET GLOBAL STREAK ───────────────────────────────────────────────────────
@app.get("/challenges")
def get_challenges():
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT daily_completed, daily_date, monthly_completed_books, current_month
            FROM user_challenges WHERE id = 1
        """)
        row = cursor.fetchone()

        today = date.today()
        current_month = today.strftime("%Y-%m")

        if not row:
            return {
                "daily": {"goal": 20, "completed": False},
                "monthly": {"goal": 2, "progress": 0}
            }

        daily_completed, daily_date, monthly_books, saved_month = row

        # reset logic (read-only)
        if daily_date != today:
            daily_completed = False

        if saved_month != current_month:
            monthly_books = 0

        return {
            "daily": {
                "goal": 20,
                "completed": daily_completed
            },
            "monthly": {
                "goal": 2,
                "progress": monthly_books,
                "completed": monthly_books >= 2
            }
        }
@app.get("/streak")
def get_streak():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT last_read_date, streak_count, freeze_count FROM user_streak WHERE id = 1"
        )
        row = cursor.fetchone()

        if not row:
            return {"last_read_date": None, "streak_count": 0, "freeze_count": 0}

        last_read, streak, freeze = row

        # ✅ READ ONLY — no DB writes here
        # Decay is handled in PATCH when the user actually logs progress
        return {
            "last_read_date": str(last_read) if last_read else None,
            "streak_count": streak or 0,
            "freeze_count": freeze or 0
        }


# ─── UPDATE QUOTES ───────────────────────────────────────────────────────────
class QuotesUpdate(BaseModel):
    quotes: List[str]


@app.patch("/books/{book_id}/quotes")
def update_quotes(book_id: int, update: QuotesUpdate):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM books WHERE id = %s", (book_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Book not found")

        cursor.execute(
            "UPDATE books SET quotes = %s WHERE id = %s",
            (json.dumps(update.quotes), book_id)
        )
        conn.commit()

    return {"message": "Quotes updated"}


# ─── UPDATE NOTES ────────────────────────────────────────────────────────────
class NotesUpdate(BaseModel):
    notes: str


@app.patch("/books/{book_id}/notes")
def update_notes(book_id: int, update: NotesUpdate):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM books WHERE id = %s", (book_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Book not found")

        cursor.execute(
            "UPDATE books SET notes = %s WHERE id = %s",
            (update.notes, book_id)
        )
        conn.commit()

    return {"message": "Notes updated"}


# ─── DELETE BOOK ─────────────────────────────────────────────────────────────
@app.delete("/books/{book_id}")
def delete_book(book_id: int):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM books WHERE id = %s", (book_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Book not found")

        cursor.execute("DELETE FROM books WHERE id = %s", (book_id,))
        conn.commit()

    return {"message": "Book deleted"}


@app.get("/stats")
def get_stats():
    MIN_PAGES_FOR_STREAK = 2

    with get_db() as conn:
        cursor = conn.cursor()

        # total books
        cursor.execute("SELECT COUNT(*) FROM books")
        total_books = cursor.fetchone()[0]

        # ── TOTAL PAGES (all reading) ──
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0)
            FROM reading_sessions
        """)
        total_pages = cursor.fetchone()[0]

        # ── STREAK PAGES (qualified only) ──
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0)
            FROM reading_sessions
            WHERE pages_read >= %s
        """, (MIN_PAGES_FOR_STREAK,))
        streak_pages = cursor.fetchone()[0]

        # ── PAGES THIS MONTH (all) ──
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0)
            FROM reading_sessions
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        """)
        monthly_pages = cursor.fetchone()[0]

        # ── STREAK PAGES THIS MONTH ──
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0)
            FROM reading_sessions
            WHERE pages_read >= %s
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        """, (MIN_PAGES_FOR_STREAK,))
        monthly_streak_pages = cursor.fetchone()[0]

        # ── months active ──
        cursor.execute("""
            SELECT COUNT(DISTINCT DATE_TRUNC('month', created_at))
            FROM reading_sessions
        """)
        months_active = cursor.fetchone()[0] or 1

        avg_pages = total_pages / months_active
        avg_streak_pages = streak_pages / months_active

    return {
        "total_books": total_books,

        # ALL reading
        "total_pages_read": total_pages,
        "pages_this_month": monthly_pages,
        "avg_pages_per_month": round(avg_pages, 2),

        # STREAK-only reading ❄️🔥
        "streak_pages_read": streak_pages,
        "streak_pages_this_month": monthly_streak_pages,
        "avg_streak_pages_per_month": round(avg_streak_pages, 2)
    }

@app.get("/quote")
async def get_quote():
    def _fetch_quote():
        req = urllib.request.Request(
            "https://zenquotes.io/api/today",
            headers={"User-Agent": "BookWebApp/1.0"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode())

    try:
        data = await asyncio.to_thread(_fetch_quote)

        if not data or "q" not in data[0]:
            raise ValueError("Invalid API response")

        return {
            "quote": data[0].get("q", "No quote"),
            "author": data[0].get("a", "Unknown")
        }

    except Exception as e:
        print("Quote fetch failed:", e)  # 👈 useful for debugging
        return {
            "quote": "A reader lives a thousand lives before he dies.",
            "author": "George R.R. Martin"
        }

@app.get("/test")
def test():
    return {"files": os.listdir()}