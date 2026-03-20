import psycopg2
import os

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
        total_pages INTEGER,
        current_page INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        quotes TEXT DEFAULT '[]'
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()

init_db()