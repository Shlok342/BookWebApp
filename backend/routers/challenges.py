from fastapi import APIRouter, Depends

from backend.auth.jwt_utils import get_current_user_id
from backend.routers.dependencies import ChallengesServiceDep

router = APIRouter()


@router.get("/challenges")
def get_challenges_router(
    service: ChallengesServiceDep,
    user_id: int = Depends(get_current_user_id),
):
    return service.get_challenges(user_id)
