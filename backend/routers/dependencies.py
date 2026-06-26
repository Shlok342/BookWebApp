from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from backend.backend_services.book_update_service import BookUpdateService
from backend.backend_services.challenges_service import ChallengesService
from backend.backend_services.heatmap_services import HeatmapService
from backend.backend_services.quote_service import QuoteService
from backend.backend_services.stat_service import StatService
from backend.backend_services.streak_service import StreakService
from backend.db.connection import get_db


def get_db_session() -> Generator[Session, None, None]:
    with get_db() as session:
        yield session


def get_heatmap_service(
    session: Session = Depends(get_db_session),
) -> HeatmapService:
    return HeatmapService(session)


def get_book_update_service(
    session: Session = Depends(get_db_session),
) -> BookUpdateService:
    return BookUpdateService(session)


def get_streak_service(
    session: Session = Depends(get_db_session),
) -> StreakService:
    return StreakService(session)


def get_stat_service(
    session: Session = Depends(get_db_session),
) -> StatService:
    return StatService(session)


def get_challenges_service(
    session: Session = Depends(get_db_session),
) -> ChallengesService:
    return ChallengesService(session)


def get_quote_service() -> QuoteService:
    return QuoteService()


HeatmapServiceDep = Annotated[HeatmapService, Depends(get_heatmap_service)]
BookUpdateServiceDep = Annotated[BookUpdateService, Depends(get_book_update_service)]
StreakServiceDep = Annotated[StreakService, Depends(get_streak_service)]
StatServiceDep = Annotated[StatService, Depends(get_stat_service)]
ChallengesServiceDep = Annotated[ChallengesService, Depends(get_challenges_service)]
QuoteServiceDep = Annotated[QuoteService, Depends(get_quote_service)]
