from fastapi import APIRouter, Depends

from backend.auth.jwt_utils import get_current_user_id
from backend.routers.dependencies import QuoteServiceDep

router = APIRouter()


@router.get("/quote")
async def get_quotes_data(
    service: QuoteServiceDep,
    user_id: int = Depends(get_current_user_id),
):
    return await service.get_quote()
