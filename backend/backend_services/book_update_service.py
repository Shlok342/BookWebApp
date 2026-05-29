from backend.db.connection import get_db
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
import json


def update_book_quotes(book_id, quotes):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            "SELECT id FROM books WHERE id = %s",
            (book_id,)
        )

        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Book not found")

        cursor.execute(
            "UPDATE books SET quotes = %s WHERE id = %s",
            (json.dumps(quotes), book_id)
        )

        conn.commit()

    return {"message": "Quotes updated"}


def update_book_notes(book_id, notes):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            "SELECT id FROM books WHERE id = %s",
            (book_id,)
        )

        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Book not found")

        cursor.execute(
            "UPDATE books SET notes = %s WHERE id = %s",
            (notes, book_id)
        )

        conn.commit()

    return {"message": "Notes updated"}


def update_book_tags(book_id, tags):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            "SELECT id FROM books WHERE id = %s",
            (book_id,)
        )

        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Book not found")

        cursor.execute(
            "UPDATE books SET tags = %s WHERE id = %s",
            (json.dumps(tags), book_id)
        )

        conn.commit()

    return {"message": "Tags updated"}