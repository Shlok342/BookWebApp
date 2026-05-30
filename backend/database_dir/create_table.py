def create_tables(cursor):
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
    cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_challenges (
                id INTEGER PRIMARY KEY,
                daily_completed BOOLEAN DEFAULT FALSE,
                daily_date DATE,

                monthly_completed_books INTEGER DEFAULT 0,
                current_month TEXT
            )
            """)
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
    
    