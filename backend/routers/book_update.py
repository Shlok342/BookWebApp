from fastapi import APIRouter, Depends

from backend.auth.jwt_utils import get_current_user_id
from backend.routers.dependencies import BookUpdateServiceDep
from backend.schemas.schemas import NotesUpdate, QuotesUpdate, TagsUpdate

router = APIRouter()


@router.patch("/books/{book_id}/quotes")
def update_quotes(
    book_id: int,
    update: QuotesUpdate,
    service: BookUpdateServiceDep,
    user_id: int = Depends(get_current_user_id),
):
    return service.update_book_quotes(book_id, update.quotes, user_id)


@router.patch("/books/{book_id}/notes")
def update_notes(
    book_id: int,
    update: NotesUpdate,
    service: BookUpdateServiceDep,
    user_id: int = Depends(get_current_user_id),
):
    return service.update_book_notes(book_id, update.notes, user_id)


@router.patch("/books/{book_id}/tags")
def update_tags(
    book_id: int,
    update: TagsUpdate,
    service: BookUpdateServiceDep,
    user_id: int = Depends(get_current_user_id),
):
    return service.update_book_tags(book_id, update.tags, user_id)
