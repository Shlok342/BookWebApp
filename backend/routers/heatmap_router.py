from fastapi import APIRouter, Depends

from backend.auth.jwt_utils import get_current_user_id
from backend.routers.dependencies import HeatmapServiceDep

router = APIRouter()


@router.get("/heatmap")
def get_heatmap(
    service: HeatmapServiceDep,
    user_id: int = Depends(get_current_user_id),
):
    return service.get_heatmap_data(user_id)
