import json

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session


class BookUpdateService:
    def __init__(self, session: Session):
        self._session = session

    def _verify_book_owner(self, book_id: int, user_id: int):
        row = self._session.execute(
            text("SELECT id FROM books WHERE id = :book_id AND user_id = :user_id"),
            {"book_id": book_id, "user_id": user_id},
        ).mappings().fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Book not found")

    def update_book_quotes(self, book_id, quotes, user_id: int):
        self._verify_book_owner(book_id, user_id)
        self._session.execute(
            text("UPDATE books SET quotes = :quotes WHERE id = :book_id AND user_id = :user_id"),
            {"quotes": json.dumps(quotes), "book_id": book_id, "user_id": user_id},
        )
        self._session.commit()
        return {"message": "Quotes updated"}

    def update_book_notes(self, book_id, notes, user_id: int):
        self._verify_book_owner(book_id, user_id)
        self._session.execute(
            text("UPDATE books SET notes = :notes WHERE id = :book_id AND user_id = :user_id"),
            {"notes": notes, "book_id": book_id, "user_id": user_id},
        )
        self._session.commit()
        return {"message": "Notes updated"}

    def update_book_tags(self, book_id, tags, user_id: int):
        self._verify_book_owner(book_id, user_id)
        self._session.execute(
            text("UPDATE books SET tags = :tags WHERE id = :book_id AND user_id = :user_id"),
            {"tags": json.dumps(tags), "book_id": book_id, "user_id": user_id},
        )
        self._session.commit()
        return {"message": "Tags updated"}
