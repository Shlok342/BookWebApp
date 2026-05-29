from pydantic import BaseModel
from typing import List
class Book(BaseModel):
    title: str
    author: str = ""
    total_pages: int
    current_page: int = 0
    genre: str = ""
    cover_url: str = ""
class PageUpdate(BaseModel):
    current_page: int
class QuotesUpdate(BaseModel):
    quotes: List[str]
class NotesUpdate(BaseModel):
    notes: str
class TagsUpdate(BaseModel):
    tags: list[str]
