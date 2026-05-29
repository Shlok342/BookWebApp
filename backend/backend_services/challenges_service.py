from backend.db.connection import get_db
from psycopg2.extras import RealDictCursor
from datetime import date
def get_challenges():
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT daily_completed, daily_date, monthly_completed_books, current_month
            FROM user_challenges WHERE id = 1
        """)
        row = cursor.fetchone()

        today = date.today()
        current_month = today.strftime("%Y-%m")

        if not row:
            return {
                "daily": {"goal": 20, "completed": False},
                "monthly": {"goal": 2, "progress": 0}
            }

        
        daily_completed = row["daily_completed"]
        daily_date = row["daily_date"]
        monthly_books = row["monthly_completed_books"]
        saved_month = row["current_month"]

        # reset logic (read-only)
        if daily_date != today:
            daily_completed = False

        if saved_month != current_month:
            monthly_books = 0

        return {
            "daily": {
                "goal": 20,
                "completed": daily_completed
            },
            "monthly": {
                "goal": 2,
                "progress": monthly_books,
                "completed": monthly_books >= 2
            }
        }  