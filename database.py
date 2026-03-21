import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()  # must be called BEFORE os.getenv()

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
        quotes TEXT DEFAULT '[]'
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()

# Run once, then remove
def migrate_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE books ADD COLUMN IF NOT EXISTS author TEXT DEFAULT ''")
    conn.commit()
    cursor.close()
    conn.close()