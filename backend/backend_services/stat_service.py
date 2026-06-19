from backend.db.connection import get_db
from psycopg2.extras import RealDictCursor


def get_stats_data(user_id: int):
    MIN_PAGES_FOR_STREAK = 2

    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            "SELECT COUNT(*) AS total_books FROM books WHERE user_id = %s",
            (user_id,),
        )
        total_books = cursor.fetchone()["total_books"]

        cursor.execute(
            """
            SELECT COALESCE(SUM(rs.pages_read), 0) AS total_pages
            FROM reading_sessions rs
            JOIN books b ON b.id = rs.book_id
            WHERE b.user_id = %s
            """,
            (user_id,),
        )
        total_pages = cursor.fetchone()["total_pages"]

        cursor.execute(
            """
            SELECT COALESCE(SUM(rs.pages_read), 0) AS streak_pages
            FROM reading_sessions rs
            JOIN books b ON b.id = rs.book_id
            WHERE b.user_id = %s AND rs.pages_read >= %s
            """,
            (user_id, MIN_PAGES_FOR_STREAK),
        )
        streak_pages = cursor.fetchone()["streak_pages"]

        cursor.execute(
            """
            SELECT COALESCE(SUM(rs.pages_read), 0) AS monthly_pages
            FROM reading_sessions rs
            JOIN books b ON b.id = rs.book_id
            WHERE b.user_id = %s
              AND rs.created_at >= DATE_TRUNC('month', CURRENT_DATE)
              AND rs.created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
            """,
            (user_id,),
        )
        monthly_pages = cursor.fetchone()["monthly_pages"]

        cursor.execute(
            """
            SELECT COALESCE(SUM(rs.pages_read), 0) AS monthly_streak_pages
            FROM reading_sessions rs
            JOIN books b ON b.id = rs.book_id
            WHERE b.user_id = %s
              AND rs.pages_read >= %s
              AND DATE_TRUNC('month', rs.created_at) = DATE_TRUNC('month', CURRENT_DATE)
            """,
            (user_id, MIN_PAGES_FOR_STREAK),
        )
        monthly_streak_pages = cursor.fetchone()["monthly_streak_pages"]

        cursor.execute(
            """
            SELECT COUNT(DISTINCT DATE_TRUNC('month', rs.created_at)) AS months_active
            FROM reading_sessions rs
            JOIN books b ON b.id = rs.book_id
            WHERE b.user_id = %s
            """,
            (user_id,),
        )
        months_active = cursor.fetchone()["months_active"] or 1

        avg_pages = total_pages / months_active
        avg_streak_pages = streak_pages / months_active

    return {
        "total_books": total_books,
        "total_pages_read": total_pages,
        "pages_this_month": monthly_pages,
        "avg_pages_per_month": round(avg_pages, 2),
        "streak_pages_read": streak_pages,
        "streak_pages_this_month": monthly_streak_pages,
        "avg_streak_pages_per_month": round(avg_streak_pages, 2),
    }
