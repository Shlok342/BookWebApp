from backend.db.connection import get_db
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
import json


def _verify_book_owner(cursor, book_id: int, user_id: int):
    cursor.execute(
        "SELECT id FROM books WHERE id = %s AND user_id = %s",
        (book_id, user_id),
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Book not found")


def update_book_quotes(book_id, quotes, user_id: int):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        _verify_book_owner(cursor, book_id, user_id)

        cursor.execute(
            "UPDATE books SET quotes = %s WHERE id = %s AND user_id = %s",
            (json.dumps(quotes), book_id, user_id),
        )
        conn.commit()

    return {"message": "Quotes updated"}


def update_book_notes(book_id, notes, user_id: int):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        _verify_book_owner(cursor, book_id, user_id)

        cursor.execute(
            "UPDATE books SET notes = %s WHERE id = %s AND user_id = %s",
            (notes, book_id, user_id),
        )
        conn.commit()

    return {"message": "Notes updated"}


def update_book_tags(book_id, tags, user_id: int):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        _verify_book_owner(cursor, book_id, user_id)

        cursor.execute(
            "UPDATE books SET tags = %s WHERE id = %s AND user_id = %s",
            (json.dumps(tags), book_id, user_id),
        )
        conn.commit()

    return {"message": "Tags updated"}
