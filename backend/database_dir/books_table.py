def create_books_table(cursor):

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
            cover_url TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)