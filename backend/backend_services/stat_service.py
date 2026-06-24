from backend.db.connection import get_db
from sqlalchemy import text


def get_stats_data(user_id: int):
    MIN_PAGES_FOR_STREAK = 2

    with get_db() as session:
        total_books = session.execute(
            text("SELECT COUNT(*) AS total_books FROM books WHERE user_id = :user_id"),
            {"user_id": user_id},
        ).mappings().fetchone()["total_books"]

        total_pages = session.execute(
            text("""
                SELECT COALESCE(SUM(rs.pages_read), 0) AS total_pages
                FROM reading_sessions rs JOIN books b ON b.id = rs.book_id
                WHERE b.user_id = :user_id
            """),
            {"user_id": user_id},
        ).mappings().fetchone()["total_pages"]

        streak_pages = session.execute(
            text("""
                SELECT COALESCE(SUM(rs.pages_read), 0) AS streak_pages
                FROM reading_sessions rs JOIN books b ON b.id = rs.book_id
                WHERE b.user_id = :user_id AND rs.pages_read >= :min_pages
            """),
            {"user_id": user_id, "min_pages": MIN_PAGES_FOR_STREAK},
        ).mappings().fetchone()["streak_pages"]

        monthly_pages = session.execute(
            text("""
                SELECT COALESCE(SUM(rs.pages_read), 0) AS monthly_pages
                FROM reading_sessions rs JOIN books b ON b.id = rs.book_id
                WHERE b.user_id = :user_id
                  AND rs.created_at >= DATE_TRUNC('month', CURRENT_DATE)
                  AND rs.created_at <  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
            """),
            {"user_id": user_id},
        ).mappings().fetchone()["monthly_pages"]

        monthly_streak_pages = session.execute(
            text("""
                SELECT COALESCE(SUM(rs.pages_read), 0) AS monthly_streak_pages
                FROM reading_sessions rs JOIN books b ON b.id = rs.book_id
                WHERE b.user_id = :user_id
                  AND rs.pages_read >= :min_pages
                  AND DATE_TRUNC('month', rs.created_at) = DATE_TRUNC('month', CURRENT_DATE)
            """),
            {"user_id": user_id, "min_pages": MIN_PAGES_FOR_STREAK},
        ).mappings().fetchone()["monthly_streak_pages"]

        months_active = session.execute(
            text("""
                SELECT COUNT(DISTINCT DATE_TRUNC('month', rs.created_at)) AS months_active
                FROM reading_sessions rs JOIN books b ON b.id = rs.book_id
                WHERE b.user_id = :user_id
            """),
            {"user_id": user_id},
        ).mappings().fetchone()["months_active"] or 1

    return {
        "total_books":               total_books,
        "total_pages_read":          total_pages,
        "pages_this_month":          monthly_pages,
        "avg_pages_per_month":       round(total_pages / months_active, 2),
        "streak_pages_read":         streak_pages,
        "streak_pages_this_month":   monthly_streak_pages,
        "avg_streak_pages_per_month":round(streak_pages / months_active, 2),
    }