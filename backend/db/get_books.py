from backend.db.connection import get_db
import json
from pathlib import Path
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from backend.schemas.schemas import PageUpdate
from fastapi import HTTPException
from backend.schemas.schemas import Book
def update_progress(book_id: int, update: PageUpdate):
    from backend.backend_services.book_services import update_progress_service
    return update_progress_service(book_id, update)
# Load env
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

def row_to_book(row):
    return {
        "id":             row["id"],
        "title":          row["title"],
        "author":         row.get("author") or "",
        "total_pages":    row["total_pages"],
        "current_page":   row["current_page"],
        "quotes":         json.loads(row["quotes"]) if row.get("quotes") else [],
        "notes":          row.get("notes") or "",
        "last_read_date": str(row["last_read_date"]) if row.get("last_read_date") else None,
        "streak_count":   row.get("streak_count") or 0,
        "created_at":     str(row["created_at"]) if row.get("created_at") else None,
        "genre":          row.get("genre") or "",
        "cover_url":      row.get("cover_url") or "",
        "tags" :  json.loads(row["tags"]) if row.get("tags") else []
   

    }
def get_books():
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT id, title, author, total_pages, current_page, quotes, notes, last_read_date, streak_count, created_at, genre,  cover_url, tags FROM books"
        )
        rows = cursor.fetchall()
    return [row_to_book(row) for row in rows]

def add_book(book: Book):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute(
                """
                INSERT INTO books (title, author, total_pages, current_page, genre, cover_url, tags)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    book.title,
                    book.author,
                    book.total_pages,
                    book.current_page,   # ✅ FIXED
                    book.genre,
                    book.cover_url,
                    "[]"
                )
            )
            conn.commit()
        except Exception as e:
            print("ERROR:", e)
            raise
    print(book)
def delete_books(book_id: int):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT id FROM books WHERE id = %s", (book_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Book not found")

        cursor.execute("DELETE FROM books WHERE id = %s", (book_id,))
        conn.commit()

    return {"message": "Book deleted"}
