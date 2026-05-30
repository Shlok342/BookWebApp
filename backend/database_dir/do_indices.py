def do_indices(cursor):
    cursor.execute("""CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id 
        ON reading_sessions(book_id);""")