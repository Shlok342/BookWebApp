from fastapi import APIRouter
from backend.backend_services.streak_service import get_streak_data

router = APIRouter()
@router.get("/streak")
def get_stats():
    return get_streak_data()