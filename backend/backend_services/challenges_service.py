from backend.db.connection import get_db
from psycopg2.extras import RealDictCursor


def get_challenges(user_id: int):
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT streak_count, freeze_count
            FROM user_streak
            WHERE user_id = %s
            """,
            (user_id,),
        )
        streak_row = cursor.fetchone() or {}

        streak_count = streak_row.get("streak_count", 0) or 0
        freeze_count = streak_row.get("freeze_count", 0) or 0

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
            SELECT COUNT(*) AS completed_books
            FROM books
            WHERE user_id = %s AND current_page >= total_pages
            """,
            (user_id,),
        )
        completed_books = cursor.fetchone()["completed_books"]

        return [
            {
                "title": "🌙 Moonlit Reader",
                "description": "Spend a quiet evening finishing your first book.",
                "completed": completed_books >= 1,
            },
            {
                "title": "🔥 Flame of Consistency",
                "description": "Maintain a 7-day reading streak.",
                "completed": streak_count >= 7,
            },
            {
                "title": "🏔 Everlasting Flame",
                "description": "Maintain a 30-day reading streak.",
                "completed": streak_count >= 30,
            },
            {
                "title": "📖 Wandering Through Pages",
                "description": "Read a total of 500 pages.",
                "completed": total_pages >= 500,
            },
            {
                "title": "✨ Master of Chapters",
                "description": "Read a total of 1000 pages.",
                "completed": total_pages >= 1000,
            },
            {
                "title": "📚 Keeper of Tomes",
                "description": "Gather 10 books in your sanctuary.",
                "completed": total_books >= 10,
            },
            {
                "title": "🏛 Librarian's Pride",
                "description": "Gather 25 books in your sanctuary.",
                "completed": total_books >= 25,
            },
            {
                "title": "❄ Guardian of Frost",
                "description": "Possess at least 3 streak freezes.",
                "completed": freeze_count >= 3,
            },
            {
                "title": "🌟 Century of Stories",
                "description": "Reach a 100-day reading streak.",
                "completed": streak_count >= 100,
            },
            {
                "title": "📕 Collector of Endings",
                "description": "Complete 5 books.",
                "completed": completed_books >= 5,
            },
        ]
