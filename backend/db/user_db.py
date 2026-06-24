import bcrypt
from fastapi import HTTPException
from backend.db.connection import get_db
from backend.database_dir.models import User


def register_user(email: str, password: str) -> dict:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    with get_db() as session:
        try:
            user = User(email=email, password_hash=hashed)
            session.add(user)
            session.commit()
            session.refresh(user)
            return {"id": user.id, "email": user.email}
        except Exception:
            raise HTTPException(status_code=400, detail="Database operation failed")


def login_user(email: str, password: str) -> dict:
    with get_db() as session:
        user = session.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"id": user.id, "email": user.email, "password_hash": user.password_hash}