from fastapi import APIRouter
from backend.schemas.auth_schemas import UserCreate, UserLogin, Token
from backend.db.user_db import register_user, login_user
from backend.auth.jwt_utils import create_access_token
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(data: UserCreate):
    user = register_user(data.email, data.password)
    return Token(access_token=create_access_token({"user_id": user["id"]}))

limiter = Limiter(key_func=get_remote_address)

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(
    request: Request,
    data: UserLogin
):
    user = login_user(data.email, data.password)

    return Token(
        access_token=create_access_token(
            {"user_id": user["id"]}
        )
    )