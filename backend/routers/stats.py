from fastapi import APIRouter, Depends
from backend.backend_services.stat_service import get_stats_data
from backend.auth.jwt_utils import get_current_user_id

router = APIRouter()

@router.get("/stats")
def get_stats(user_id: int = Depends(get_current_user_id)):
    return get_stats_data(user_id)