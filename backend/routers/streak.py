from fastapi import APIRouter, Depends

from backend.auth.jwt_utils import get_current_user_id
from backend.routers.dependencies import StreakServiceDep

router = APIRouter()


@router.get("/streak")
def get_streak(
    service: StreakServiceDep,
    user_id: int = Depends(get_current_user_id),
):
    return service.get_streak_data(user_id)
