from datetime import date, timedelta

from sqlalchemy import text
from sqlalchemy.orm import Session


class HeatmapService:
    def __init__(self, session: Session):
        self._session = session

    def get_heatmap_data(self, user_id: int):
        rows = self._session.execute(
            text("""
                SELECT
                    DATE(rs.created_at) AS day,
                    SUM(rs.pages_read)  AS total_pages
                FROM reading_sessions rs
                JOIN books b ON b.id = rs.book_id
                WHERE b.user_id = :user_id
                  AND rs.created_at >= CURRENT_DATE - INTERVAL '365 days'
                GROUP BY DATE(rs.created_at)
                ORDER BY day
            """),
            {"user_id": user_id},
        ).mappings().fetchall()

        rows = [dict(r) for r in rows]

        pages_this_year = sum(row["total_pages"] for row in rows)
        active_dates = {row["day"] for row in rows}
        active_days = len(active_dates)

        current_streak = 0
        check_day = date.today()
        if check_day not in active_dates and check_day - timedelta(days=1) in active_dates:
            check_day -= timedelta(days=1)
        while check_day in active_dates:
            current_streak += 1
            check_day -= timedelta(days=1)

        longest_streak, streak, previous = 0, 0, None
        for day in sorted(active_dates):
            streak = streak + 1 if (previous and day == previous + timedelta(days=1)) else 1
            longest_streak = max(longest_streak, streak)
            previous = day

        return {
            "days": rows,
            "stats": {
                "active_days": active_days,
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "pages_this_year": pages_this_year,
            },
        }
