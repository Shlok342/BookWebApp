from fastapi import APIRouter, Depends 
from backend.auth.jwt_utils import get_current_user_id

from backend.schemas.schemas import PageUpdate

from backend.db .get_books import (
    get_books,
    add_book,
    delete_books,
    update_progress,
    Book
)

router = APIRouter()


# ─── GET ALL BOOKS ───────────────────────────────────────────────────────────

@router.get("/books")
def modularized_get_books(user_id: int = Depends(get_current_user_id)):
    return get_books(user_id)


# ─── ADD BOOK ────────────────────────────────────────────────────────────────

@router.post("/books")
def modularized_add_book(book: Book, user_id: int = Depends(get_current_user_id)):
    return add_book(book, user_id)


# ─── UPDATE BOOK PROGRESS ────────────────────────────────────────────────────

@router.patch("/books/{book_id}")
def modularized_update_progress(
    book_id: int,
    update: PageUpdate,
    user_id: int = Depends(get_current_user_id),
):
    return update_progress(book_id, update, user_id)


# ─── DELETE BOOK ─────────────────────────────────────────────────────────────

@router.delete("/books/{book_id}")
def modularized_delete_book(book_id: int, user_id: int = Depends(get_current_user_id)):
    return delete_books(book_id, user_id)