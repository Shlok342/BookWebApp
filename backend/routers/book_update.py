from fastapi import APIRouter

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
def update_quotes(book_id: int, update: QuotesUpdate):
    return update_book_quotes(book_id, update.quotes)


@router.patch("/books/{book_id}/notes")
def update_notes(book_id: int, update: NotesUpdate):
    return update_book_notes(book_id, update.notes)


@router.patch("/books/{book_id}/tags")
def update_tags(book_id: int, update: TagsUpdate):
    return update_book_tags(book_id, update.tags)