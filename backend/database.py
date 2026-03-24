import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

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

    conn.commit()
    cursor.close()
    conn.close()

init_db()