from backend.db.connection import get_db
from psycopg2.extras import RealDictCursor
from datetime import date, timedelta


def get_heatmap_data():
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT
                DATE(created_at) as day,
                SUM(pages_read) as total_pages
            FROM reading_sessions
            WHERE created_at >= CURRENT_DATE - INTERVAL '365 days'
            GROUP BY DATE(created_at)
            ORDER BY day
        """)

        rows = cursor.fetchall()
        pages_this_year = sum(
        row["total_pages"]
        for row in rows
        )
    active_dates = {
    row["day"] for row in rows
}

    active_days = len(active_dates)

# -------------------------
# Current streak
# -------------------------

    current_streak = 0

    check_day = date.today()

    if (
        check_day not in active_dates
        and check_day - timedelta(days=1) in active_dates
    ):
        check_day -= timedelta(days=1)

    while check_day in active_dates:
        current_streak += 1
        check_day -= timedelta(days=1)

# -------------------------
# Longest streak
# -------------------------

    longest_streak = 0
    streak = 0

    sorted_days = sorted(active_dates)

    previous = None

    for day in sorted_days:

        if (
            previous
            and day == previous + timedelta(days=1)
        ):
            streak += 1

        else:
            streak = 1

        longest_streak = max(
            longest_streak,
            streak
        )

    previous = day

    return {
        "days": rows,
        "stats": {
            "active_days": active_days,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "pages_this_year": pages_this_year
        }
    }