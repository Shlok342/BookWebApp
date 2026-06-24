import json
from fastapi import HTTPException
from backend.db.connection import get_db
from backend.database_dir.models import Book as BookModel
from backend.schemas.schemas import Book, PageUpdate
from sqlalchemy import desc


def model_to_dict(book: BookModel) -> dict:
    return {
        "id":             book.id,
        "title":          book.title,
        "author":         book.author or "",
        "total_pages":    book.total_pages,
        "current_page":   book.current_page,
        "quotes":         json.loads(book.quotes) if book.quotes else [],
        "notes":          book.notes or "",
        "last_read_date": str(book.last_read_date) if book.last_read_date else None,
        "streak_count":   book.streak_count or 0,
        "created_at":     str(book.created_at) if book.created_at else None,
        "genre":          book.genre or "",
        "cover_url":      book.cover_url or "",
        "tags":           json.loads(book.tags) if book.tags else [],
    }


def get_books(user_id: int):
    with get_db() as session:
        books = (
            session.query(BookModel)
            .filter(BookModel.user_id == user_id)
            .order_by(desc(BookModel.created_at))
            .all()
        )
        return [model_to_dict(b) for b in books]


def add_book(book: Book, user_id: int):
    with get_db() as session:
        try:
            new_book = BookModel(
                title=book.title,
                author=book.author,
                total_pages=book.total_pages,
                current_page=book.current_page,
                genre=book.genre,
                cover_url=book.cover_url,
                tags="[]",
                user_id=user_id,
            )
            session.add(new_book)
            session.commit()
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


def delete_books(book_id: int, user_id: int):
    with get_db() as session:
        book = session.query(BookModel).filter(
            BookModel.id == book_id,
            BookModel.user_id == user_id,
        ).first()

        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        session.delete(book)
        session.commit()

    return {"message": "Book deleted"}


def update_progress(book_id: int, update: PageUpdate, user_id: int):
    from backend.backend_services.book_services import update_progress_service
    return update_progress_service(book_id, update, user_id)