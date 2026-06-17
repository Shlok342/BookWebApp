from passlib.context import CryptContext
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
from backend.db.connection import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def register_user(email: str, password: str) -> dict:
    hashed = pwd_context.hash(password)
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute(
                "INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id, email",
                (email, hashed)
            )
            user = cursor.fetchone()
            conn.commit()
            return dict(user)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )

def login_user(email: str, password: str) -> dict:
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
    if not user or not pwd_context.verify(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return dict(user)