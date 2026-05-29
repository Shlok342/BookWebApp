from backend.db.connection import get_db
from psycopg2.extras import RealDictCursor
def get_stats_data():
    MIN_PAGES_FOR_STREAK = 2

    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # ── TOTAL BOOKS ──
        cursor.execute("SELECT COUNT(*) AS total_books FROM books")
        total_books = cursor.fetchone()["total_books"]

        # ── TOTAL PAGES (all reading) ──
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0) AS total_pages
            FROM reading_sessions
        """)
        total_pages = cursor.fetchone()["total_pages"]

        # ── STREAK PAGES (qualified only) ──
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0) AS streak_pages
            FROM reading_sessions
            WHERE pages_read >= %s
        """, (MIN_PAGES_FOR_STREAK,))
        streak_pages = cursor.fetchone()["streak_pages"]

        # ── PAGES THIS MONTH (all) ──
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0) AS monthly_pages
            FROM reading_sessions
            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
              AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'   

        """)
        monthly_pages = cursor.fetchone()["monthly_pages"]

        # ── STREAK PAGES THIS MONTH ──
        cursor.execute("""
            SELECT COALESCE(SUM(pages_read), 0) AS monthly_streak_pages
            FROM reading_sessions
            WHERE pages_read >= %s
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        """, (MIN_PAGES_FOR_STREAK,))
        monthly_streak_pages = cursor.fetchone()["monthly_streak_pages"]

        # ── MONTHS ACTIVE ──
        cursor.execute("""
            SELECT COUNT(DISTINCT DATE_TRUNC('month', created_at)) AS months_active
            FROM reading_sessions
        """)
        months_active = cursor.fetchone()["months_active"] or 1

        # ── AVERAGES ──
        avg_pages = total_pages / months_active
        avg_streak_pages = streak_pages / months_active

    return {
        "total_books": total_books,

        # ALL reading
        "total_pages_read": total_pages,
        "pages_this_month": monthly_pages,
        "avg_pages_per_month": round(avg_pages, 2),

        # STREAK-only reading ❄️🔥
        "streak_pages_read": streak_pages,
        "streak_pages_this_month": monthly_streak_pages,
        "avg_streak_pages_per_month": round(avg_streak_pages, 2)
    }