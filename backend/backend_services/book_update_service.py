from backend.db.connection import get_db
from sqlalchemy import text
from fastapi import HTTPException
import json


def _verify_book_owner(session, book_id: int, user_id: int):
    row = session.execute(
        text("SELECT id FROM books WHERE id = :book_id AND user_id = :user_id"),
        {"book_id": book_id, "user_id": user_id},
    ).mappings().fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")


def update_book_quotes(book_id, quotes, user_id: int):
    with get_db() as session:
        _verify_book_owner(session, book_id, user_id)
        session.execute(
            text("UPDATE books SET quotes = :quotes WHERE id = :book_id AND user_id = :user_id"),
            {"quotes": json.dumps(quotes), "book_id": book_id, "user_id": user_id},
        )
        session.commit()
    return {"message": "Quotes updated"}


def update_book_notes(book_id, notes, user_id: int):
    with get_db() as session:
        _verify_book_owner(session, book_id, user_id)
        session.execute(
            text("UPDATE books SET notes = :notes WHERE id = :book_id AND user_id = :user_id"),
            {"notes": notes, "book_id": book_id, "user_id": user_id},
        )
        session.commit()
    return {"message": "Notes updated"}


def update_book_tags(book_id, tags, user_id: int):
    with get_db() as session:
        _verify_book_owner(session, book_id, user_id)
        session.execute(
            text("UPDATE books SET tags = :tags WHERE id = :book_id AND user_id = :user_id"),
            {"tags": json.dumps(tags), "book_id": book_id, "user_id": user_id},
        )
        session.commit()
    return {"message": "Tags updated"}