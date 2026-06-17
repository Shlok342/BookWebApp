from fastapi import APIRouter,Depends
from backend.backend_services.quote_service import get_quote
from backend.auth.jwt_utils import get_current_user_id
router = APIRouter()

@router.get("/quote")
async def get_quotes_data(user_id: int = Depends(get_current_user_id)):
    return await get_quote()