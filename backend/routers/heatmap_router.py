from fastapi import APIRouter, Depends 
from backend.backend_services.heatmap_services import get_heatmap_data
from backend.auth.jwt_utils import get_current_user_id


router = APIRouter()

@router.get("/heatmap")
def get_heatmap(user_id: int = Depends(get_current_user_id)):
    return get_heatmap_data()