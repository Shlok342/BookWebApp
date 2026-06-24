from datetime import date
from sqlalchemy.orm import Session
from backend.database2 import engine, Base
from .models import UserChallenge, UserStreak  # noqa: F401 — needed for Base.metadata


def init_db():
    Base.metadata.create_all(engine)  # creates all tables + indexes from models
    _seed_defaults()


def _seed_defaults():
    with Session(engine) as session:
        if not session.get(UserChallenge, 1):
            session.add(UserChallenge(
                id=1,
                daily_completed=False,
                monthly_completed_books=0,
                current_month=date.today().strftime("%Y-%m"),
            ))
        if not session.get(UserStreak, 1):
            session.add(UserStreak(id=1, last_read_date=None, streak_count=0))
        session.commit()