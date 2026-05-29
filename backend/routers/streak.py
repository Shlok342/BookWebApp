from fastapi import APIRouter
from backend.db.connection import get_db
from datetime import date
from psycopg2.extras import RealDictCursor
router=APIRouter()
@router.get("/streak")
def get_streak():
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT last_read_date, streak_count, freeze_count FROM user_streak WHERE id = 1"
        )
        row = cursor.fetchone()

        if not row:
            return {
                "last_read_date": None,
                "streak_count": 0,
                "freeze_count": 0,
                "streak_status": "no_data"
            }

        last_read = row["last_read_date"]
        streak = row["streak_count"] or 0
        freeze = row["freeze_count"] or 0

        if last_read and not isinstance(last_read, date):
            last_read = date.fromisoformat(str(last_read))

        today = date.today()
        gap = (today - last_read).days if last_read else 0

        # 🔥 LIVE STATUS CALCULATION
        if gap == 0:
            status = "safe"
        elif gap == 1:
            status = "at_risk"   # must read today
        elif gap == 2:
            if freeze > 0:
                status = "freeze_used_today"
            else:
                status = "broken"
        else:
            status = "broken"

        return {
            "last_read_date": str(last_read) if last_read else None,
            "streak_count": streak,
            "freeze_count": freeze,
            "gap": gap,
            "status": status
        }