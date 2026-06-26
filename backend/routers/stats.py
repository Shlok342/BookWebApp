from fastapi import APIRouter, Depends

from backend.auth.jwt_utils import get_current_user_id
from backend.routers.dependencies import StatServiceDep

router = APIRouter()


@router.get("/stats")
def get_stats(
    service: StatServiceDep,
    user_id: int = Depends(get_current_user_id),
):
    return service.get_stats_data(user_id)
