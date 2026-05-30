def do_insertion(cursor):
    cursor.execute("""
        INSERT INTO user_challenges (id, daily_completed, monthly_completed_books, current_month)
        VALUES (1, FALSE, 0, TO_CHAR(CURRENT_DATE, 'YYYY-MM'))
        ON CONFLICT (id) DO NOTHING
        """)
        
        
    cursor.execute("""
        INSERT INTO user_streak (id, last_read_date, streak_count)
        VALUES (1, NULL, 0)
        ON CONFLICT (id) DO NOTHING
        """)