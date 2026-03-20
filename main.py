from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from contextlib import contextmanager
from database import init_db, get_connection
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "id":           row[0],
        "title":        row[1],
        "total_pages":  row[2],
        "current_page": row[3],
        "quotes":       json.loads(row[4]) if row[4] else [],
        "notes":        row[5] if row[5] else ""
    }

# ─── GET ALL BOOKS ───────────────────────────────────────────────────────────
@app.get("/books")
def get_books():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, total_pages, current_page, quotes, notes FROM books")
        rows = cursor.fetchall()
    return [row_to_book(row) for row in rows]

# ─── GET SINGLE BOOK ─────────────────────────────────────────────────────────
@app.get("/books/{book_id}")
def get_book(book_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, total_pages, current_page, quotes, notes FROM books WHERE id = %s",
            (book_id,)
        )
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Book not found")

    return row_to_book(row)

# ─── ADD BOOK ────────────────────────────────────────────────────────────────
class Book(BaseModel):
    title: str
    total_pages: int
    current_page: int = 0

@app.post("/books", status_code=201)
def add_book(book: Book):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO books (title, total_pages, current_page, quotes, notes) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (book.title, book.total_pages, book.current_page, "[]", "")
        )
        new_id = cursor.fetchone()[0]
        conn.commit()

    return {"message": "Book added", "id": new_id}

# ─── UPDATE PROGRESS ─────────────────────────────────────────────────────────
class PageUpdate(BaseModel):
    current_page: int

@app.patch("/books/{book_id}")
def update_progress(book_id: int, update: PageUpdate):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM books WHERE id = %s", (book_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Book not found")

        cursor.execute(
            "UPDATE books SET current_page = %s WHERE id = %s",
            (update.current_page, book_id)
        )
        conn.commit()

    return {"message": "Progress updated"}

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

# ─── UPDATE NOTES ─────────────────────────────────────────────────────────────
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

# ─── DELETE BOOK ──────────────────────────────────────────────────────────────
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