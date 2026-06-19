import bcrypt  # <-- Changed library import
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
from backend.db.connection import get_db

def register_user(email: str, password: str) -> dict:
    # bcrypt requires raw bytes instead of a plain string
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    # Generate the hash and convert it back to a readable string format
    hashed = bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')
    
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
        
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # Convert inputs to required bytes to match against the stored hash safely
    plain_bytes = password.encode('utf-8')
    hashed_bytes = user["password_hash"].encode('utf-8')
    
    # Check password match natively without passlib
    if not bcrypt.checkpw(plain_bytes, hashed_bytes):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return dict(user)
