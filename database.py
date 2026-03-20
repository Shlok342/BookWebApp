import sqlite3

def init_db():
    conn = sqlite3.connect("books.db")
    cursor = conn.cursor()

    # Create table with all columns if it doesn't exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        title        TEXT,
        total_pages  INTEGER,
        current_page INTEGER DEFAULT 0,
        notes        TEXT    DEFAULT '',
        quotes       TEXT    DEFAULT '[]'
    )
    """)

    # Migrate existing DBs that are missing the new columns
    existing = [row[1] for row in cursor.execute("PRAGMA table_info(books)").fetchall()]
    if "notes" not in existing:
        cursor.execute("ALTER TABLE books ADD COLUMN notes TEXT DEFAULT ''")
    if "quotes" not in existing:
        cursor.execute("ALTER TABLE books ADD COLUMN quotes TEXT DEFAULT '[]'")

    conn.commit()
    conn.close()

init_db()