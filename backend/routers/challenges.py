from fastapi import APIRouter, Depends
from backend.auth.jwt_utils import get_current_user_id
from backend.backend_services.challenges_service import get_challenges

router = APIRouter()

@router.get("/challenges")
def get_challenges_router(user_id: int = Depends(get_current_user_id)):
    return get_challenges(user_id)