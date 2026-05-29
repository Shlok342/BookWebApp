from fastapi import APIRouter
from backend.backend_services.quote_service import get_quote

router = APIRouter()

@router.get("/quote")
def get_quotes_data():
    return get_quote()