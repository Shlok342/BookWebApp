import os 
from psycopg2 import connect
import json
from pathlib import Path
from dotenv import load_dotenv
from contextlib import contextmanager
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
class PageUpdate(BaseModel):
    current_page: int
class Book(BaseModel):
    title: str
    author: str = ""
    total_pages: int
    current_page: int = 0
    genre: str = ""
    cover_url: str = ""
from backend.backend_services.book_services import update_progress_service
# Load env
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))
def get_connection():
    return connect(os.getenv("DATABASE_URL"))
@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()

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
def update_progress(book_id: int, update: PageUpdate):
    return update_progress_service(book_id, update)