from pydantic import BaseModel
from typing import List
class PageUpdate(BaseModel):
    current_page: int
class QuotesUpdate(BaseModel):
    quotes: List[str]
class NotesUpdate(BaseModel):
    notes: str
class TagsUpdate(BaseModel):
    tags: list[str]