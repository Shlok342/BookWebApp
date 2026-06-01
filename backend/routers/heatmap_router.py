from fastapi import APIRouter
from backend.backend_services.heatmap_services import get_heatmap_data

router = APIRouter()

@router.get("/heatmap")
def get_heatmap():
    return get_heatmap_data()