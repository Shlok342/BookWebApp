from fastapi import APIRouter, Depends
from backend.backend_services.streak_service import get_streak_data
from backend.auth.jwt_utils import get_current_user_id
router = APIRouter()
@router.get("/streak")
def get_stats(user_id: int = Depends(get_current_user_id)):
    return get_streak_data()