import os
from pathlib import Path
from dotenv import load_dotenv
from psycopg2 import connect 

# Load env
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

def get_connection():
    return connect(os.getenv("DATABASE_URL"))

def init_db():
    with get_connection() as conn:
        with conn.cursor() as cursor:
    

    # ─── BOOKS TABLE ─────────────────────────────────────────
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
                streak_count INTEGER DEFAULT 0,
                genre TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

            # ─── SAFE MIGRATIONS (for existing DB) ───────────────────
            cursor.execute("""
            ALTER TABLE books
                ADD COLUMN IF NOT EXISTS last_read_date DATE DEFAULT NULL
            """)
            cursor.execute("""
            ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url TEXT DEFAULT '';
            """)
            

            

            cursor.execute("""
            ALTER TABLE books
                ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0
            """)

            cursor.execute("""
            ALTER TABLE books
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """)

            # ─── READING SESSIONS ────────────────────────────────────
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS reading_sessions (
                id SERIAL PRIMARY KEY,
                book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
                pages_read INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)

            # ─── GLOBAL STREAK ───────────────────────────────────────
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_streak (
                id INTEGER PRIMARY KEY DEFAULT 1,
                last_read_date DATE DEFAULT NULL,
                streak_count INTEGER DEFAULT 0
            )
            """)
            cursor.execute("""CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id 
        ON reading_sessions(book_id);""")
            cursor.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='user_streak' AND column_name='freeze_count'
            ) THEN
                ALTER TABLE user_streak ADD COLUMN freeze_count INTEGER DEFAULT 2;
            END IF;
        END $$;
        """)
            cursor.execute("""
            INSERT INTO user_streak (id, last_read_date, streak_count)
            VALUES (1, NULL, 0)
            ON CONFLICT (id) DO NOTHING
            """)
            
 
    conn.close()