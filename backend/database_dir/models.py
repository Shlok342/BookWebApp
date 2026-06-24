from datetime import date
from sqlalchemy import (
    Column, Integer, Text, Boolean, Date, DateTime,
    ForeignKey, CheckConstraint, Index, text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database2 import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    email         = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    created_at    = Column(DateTime, server_default=func.now())

    books     = relationship("Book", back_populates="user")
    streak    = relationship("UserStreak", back_populates="user", uselist=False)
    challenge = relationship("UserChallenge", back_populates="user", uselist=False)


class Book(Base):
    __tablename__ = "books"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    title         = Column(Text)
    author        = Column(Text, default="")
    total_pages   = Column(Integer)
    current_page  = Column(Integer, default=0)
    notes         = Column(Text, default="")
    quotes        = Column(Text, default="[]")
    tags          = Column(Text, default="[]")
    last_read_date= Column(Date, default=None)
    streak_count  = Column(Integer, default=0)
    genre         = Column(Text, default="")
    cover_url     = Column(Text, default="")
    created_at    = Column(DateTime, server_default=func.now())
    user_id       = Column(Integer, ForeignKey("users.id"))

    user             = relationship("User", back_populates="books")
    reading_sessions = relationship("ReadingSession", back_populates="book", cascade="all, delete")

    __table_args__ = (
        Index("idx_books_user_id", "user_id"),
    )


class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id                      = Column(Integer, primary_key=True)  # not SERIAL, inserted as 1
    daily_completed         = Column(Boolean, default=False)
    daily_date              = Column(Date)
    monthly_completed_books = Column(Integer, default=0)
    current_month           = Column(Text)
    user_id                 = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="challenge")

    __table_args__ = (
        Index(
            "user_challenges_user_id_unique", "user_id",
            unique=True, postgresql_where=text("user_id IS NOT NULL")
        ),
    )


class ReadingSession(Base):
    __tablename__ = "reading_sessions"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    book_id    = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"))
    pages_read = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

    book = relationship("Book", back_populates="reading_sessions")

    __table_args__ = (
        Index("idx_reading_sessions_book_id", "book_id"),
    )


class UserStreak(Base):
    __tablename__ = "user_streak"

    id             = Column(Integer, primary_key=True)  # not SERIAL
    last_read_date = Column(Date, default=None)
    streak_count   = Column(Integer, default=0)
    freeze_count   = Column(Integer, default=2)
    user_id        = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="streak")

    __table_args__ = (
        CheckConstraint(
            "(last_read_date IS NULL AND streak_count = 0) OR "
            "(last_read_date IS NOT NULL AND streak_count >= 1)",
            name="valid_streak"
        ),
        Index(
            "user_streak_user_id_unique", "user_id",
            unique=True, postgresql_where=text("user_id IS NOT NULL")
        ),
    )