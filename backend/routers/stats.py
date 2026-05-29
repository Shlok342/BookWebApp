from fastapi import APIRouter
from backend.backend_services.stat_service import get_stats_data

router = APIRouter()

@router.get("/stats")
def get_stats():
    return get_stats_data()