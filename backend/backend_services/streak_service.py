from datetime import date

from sqlalchemy import text
from sqlalchemy.orm import Session


class StreakService:
    def __init__(self, session: Session):
        self._session = session

    def get_streak_data(self, user_id: int):
        row = self._session.execute(
            text("""
                SELECT last_read_date, streak_count, freeze_count
                FROM user_streak WHERE user_id = :user_id
            """),
            {"user_id": user_id},
        ).mappings().fetchone()

        if not row:
            return {"last_read_date": None, "streak_count": 0, "freeze_count": 0, "streak_status": "no_data"}

        last_read = row["last_read_date"]
        streak = row["streak_count"] or 0
        freeze = row["freeze_count"] or 0

        if last_read and not isinstance(last_read, date):
            last_read = date.fromisoformat(str(last_read))

        today = date.today()
        gap = (today - last_read).days if last_read else 0

        if gap == 0:
            status = "safe"
        elif gap == 1:
            status = "at_risk"
        elif gap == 2:
            status = "freeze_used_today" if freeze > 0 else "broken"
        else:
            status = "broken"

        return {
            "last_read_date": str(last_read) if last_read else None,
            "streak_count": streak,
            "freeze_count": freeze,
            "gap": gap,
            "status": status,
        }
