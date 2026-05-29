from fastapi import APIRouter
from backend.backend_services.challenges_service import get_challenges

router = APIRouter()

@router.get("/challenges")
def get_challenges_router():
    return get_challenges()