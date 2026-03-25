import os
from pathlib import Path
from dotenv import load_dotenv
from psycopg2 import connect 
# Load the .env that sits next to this file (not based on current working directory).
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

def get_connection():
    # `psycopg2` isn't imported directly; we import `connect` above.
    return connect(os.getenv("DATABASE_URL"))

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Create table (PostgreSQL version)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT,
        author TEXT DEFAULT '',
        total_pages INTEGER,
        current_page INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        quotes TEXT DEFAULT '[]',
        last_read_date DATE DEFAULT NULL,
        streak_count INTEGER DEFAULT 0
    )
    """)

    # Migration: add columns if they don't exist (for existing databases)
    cursor.execute("""
    ALTER TABLE books
        ADD COLUMN IF NOT EXISTS last_read_date DATE DEFAULT NULL
    """)

    cursor.execute("""
    ALTER TABLE books
        ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0
    """)

    # ── Global streak table ───────────────────────────────────────────────────
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_streak (
        id INTEGER PRIMARY KEY DEFAULT 1,
        last_read_date DATE DEFAULT NULL,
        streak_count INTEGER DEFAULT 0
    )
    """)

    # Seed the single row if it doesn't exist yet
    cursor.execute("""
    INSERT INTO user_streak (id, last_read_date, streak_count)
    VALUES (1, NULL, 0)
    ON CONFLICT (id) DO NOTHING
    """)
    # ─────────────────────────────────────────────────────────────────────────

    conn.commit()
    cursor.close()
    conn.close()