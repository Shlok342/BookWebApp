from fastapi import APIRouter, Depends 

from backend.auth.jwt_utils import get_current_user_id

from backend.schemas.schemas import (
    QuotesUpdate,
    NotesUpdate,
    TagsUpdate
)

from backend.backend_services.book_update_service import (
    update_book_quotes,
    update_book_notes,
    update_book_tags
)

router = APIRouter()


@router.patch("/books/{book_id}/quotes")
def update_quotes(book_id: int, update: QuotesUpdate, user_id: int = Depends(get_current_user_id)):
    return update_book_quotes(book_id, update.quotes, user_id)


@router.patch("/books/{book_id}/notes")
def update_notes(book_id: int, update: NotesUpdate, user_id: int = Depends(get_current_user_id)):
    return update_book_notes(book_id, update.notes, user_id)


@router.patch("/books/{book_id}/tags")
def update_tags(book_id: int, update: TagsUpdate, user_id: int = Depends(get_current_user_id)):
    return update_book_tags(book_id, update.tags, user_id)