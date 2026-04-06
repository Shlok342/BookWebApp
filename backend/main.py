import os
import json
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
    MIN_PAGES_FOR_STREAK = 2

    with get_db() as conn:
        cursor = conn.cursor()

        # ── Get current state ──
        cursor.execute(
            "SELECT current_page, last_read_date, streak_count FROM books WHERE id = %s",
            (book_id,)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Book not found")

        current_page_old, last_read_date, streak_count = row
        today = date.today()

        # ── Calculate pages read ──
        if update.current_page >= current_page_old:
            pages_read = update.current_page - current_page_old
        else:
            # User corrected mistake — no reading happened
            pages_read = 0

        # ── Per-book streak ──
        if pages_read >= MIN_PAGES_FOR_STREAK:
            if last_read_date is None:
                new_streak = 1
            elif last_read_date == today:
                new_streak = streak_count
            elif (today - last_read_date).days == 1:
                new_streak = streak_count + 1
            else:
                new_streak = streak_count   # 🔥 FREEZE

            new_last_read_date = today
        else:
            new_streak = streak_count
            new_last_read_date = last_read_date

        # ── Update book ──
        cursor.execute(
            """
            UPDATE books 
            SET current_page = %s, last_read_date = %s, streak_count = %s 
            WHERE id = %s
            """,
            (update.current_page, new_last_read_date, new_streak, book_id)
        )

        # ── Insert reading session ──
        if pages_read > 0:
            cursor.execute(
                """
                INSERT INTO reading_sessions (book_id, pages_read)
                VALUES (%s, %s)
                """,
                (book_id, pages_read)
            )

        # ── Get global streak ──
        cursor.execute(
            "SELECT last_read_date, streak_count, freeze_count FROM user_streak WHERE id = 1"
        )
        g = cursor.fetchone()

        if g is None:
            cursor.execute(
                "INSERT INTO user_streak (id, last_read_date, streak_count, freeze_count) VALUES (1, NULL, 0, 2)"
            )
            g_last, g_streak, g_freeze = None, 0, 2
        else:
            g_last, g_streak, g_freeze = g  # ✅ FIXED unpacking

        # ── Global streak ──
        if pages_read >= MIN_PAGES_FOR_STREAK:
            if g_last is None:
                new_global_streak = 1

            elif g_last == today:
                new_global_streak = g_streak

            elif (today - g_last).days == 1:
                new_global_streak = g_streak + 1

            else:
                # ❄️ MISSED DAY
                if g_freeze > 0:
                    new_global_streak = g_streak + 1
                    g_freeze -= 1
                else:
                    new_global_streak = g_streak

            new_global_last_read = today

        else:
            new_global_streak = g_streak
            new_global_last_read = g_last  # ⚠️ DON'T overwrite date

        # ── Update global streak ──
        cursor.execute(
            """
            UPDATE user_streak 
            SET last_read_date = %s, streak_count = %s, freeze_count = %s 
            WHERE id = 1
            """,
            (new_global_last_read, new_global_streak, g_freeze)
        )

        conn.commit()

    return {
        "message": "Progress updated",
        "pages_logged": pages_read,
        "streak_count": new_streak,
        "global_streak": new_global_streak,
        "last_read_date": str(new_last_read_date) if new_last_read_date else None,
        "qualified_for_streak": pages_read >= MIN_PAGES_FOR_STREAK,
        "freeze_count":g_freeze}
        

# ─── GET GLOBAL STREAK ───────────────────────────────────────────────────────
@app.get("/streak")
def get_streak():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT last_read_date, streak_count FROM user_streak WHERE id = 1"
        )
        row = cursor.fetchone()
        if not row:
            return {
                "last_read_date": None,
                "streak_count": 0
            }
        else:
            return {
                "last_read_date": str(row[0]) if row[0] else None,
                "streak_count":   row[1] if row[1] else 0
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

from datetime import datetime

@app.get("/stats")
def get_stats():
    with get_db() as conn:
        cursor = conn.cursor()

        # total books
        cursor.execute("SELECT COUNT(*) FROM books")
        total_books = cursor.fetchone()[0]

        # total pages read
        cursor.execute("SELECT COALESCE(SUM(pages_read), 0) FROM reading_sessions")
        total_pages = cursor.fetchone()[0]

        # pages this month
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0)
            FROM reading_sessions
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        """)
        monthly_pages = cursor.fetchone()[0]

        # months active (VERY IMPORTANT)
        cursor.execute("""
            SELECT COUNT(DISTINCT DATE_TRUNC('month', created_at))
            FROM reading_sessions
        """)
        months_active = cursor.fetchone()[0] or 1

        avg_pages = total_pages / months_active

    return {
        "total_books": total_books,
        "total_pages_read": total_pages,
        "pages_this_month": monthly_pages,
        "avg_pages_per_month": round(avg_pages, 2)
    }
@app.get("/test")
def test():
    return {"files": os.listdir()}