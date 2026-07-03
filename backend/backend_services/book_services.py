from datetime import date
from fastapi import HTTPException
from backend.db.connection import get_db
from sqlalchemy import text

MIN_PAGES_FOR_STREAK = 2


def update_progress_service(book_id: int, update, user_id: int):
    with get_db() as session:
        book = get_book(session, book_id, user_id)

        if update.current_page < 0:
            raise HTTPException(400, "Page cannot be negative")
        if update.current_page > book["total_pages"]:
            update.current_page = book["total_pages"]

        pages_read = calculate_pages_read(book["current_page"], update.current_page)
        qualified  = pages_read >= MIN_PAGES_FOR_STREAK

        new_streak, new_last_read = update_streak_logic(
            book["last_read_date"], book["streak_count"], pages_read
        )

        if pages_read > 0:
            update_book(session, book_id, user_id, update.current_page, new_last_read, new_streak)

        handle_challenges(session, user_id, pages_read, book_id, book["current_page"], update.current_page)
        log_reading_session(session, book_id, pages_read)
        global_streak, freeze_count = update_global_streak(session, user_id, pages_read)

        session.commit()

    return {
        "success": True,
        "data": {
            "pages_logged":          pages_read,
            "streak_count":          new_streak,
            "global_streak":         global_streak,
            "freeze_count":          freeze_count,
            "qualified_for_streak":  qualified,
        },
    }


def get_book(session, book_id, user_id):
    row = session.execute(
        text("""
            SELECT current_page, last_read_date, streak_count, total_pages
            FROM books WHERE id = :book_id AND user_id = :user_id
        """),
        {"book_id": book_id, "user_id": user_id},
    ).mappings().fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Book not found")

    last_read_date = row["last_read_date"]
    if last_read_date and not isinstance(last_read_date, date):
        last_read_date = date.fromisoformat(str(last_read_date))

    return {
        "current_page":   row["current_page"],
        "last_read_date": last_read_date,
        "streak_count":   row["streak_count"],
        "total_pages":    row["total_pages"],
    }


def calculate_pages_read(old, new):
    return max(0, new - old)


def update_streak_logic(last_read_date, streak_count, pages_read):
    today     = date.today()
    qualified = pages_read >= MIN_PAGES_FOR_STREAK

    if not qualified:                              return streak_count, last_read_date
    if last_read_date is None:                     return 1, today
    if last_read_date == today:                    return streak_count, today
    if (today - last_read_date).days == 1:         return streak_count + 1, today
    return 1, today


def update_book(session, book_id, user_id, current_page, last_read_date, streak):
    session.execute(
        text("""
            UPDATE books
            SET current_page = :current_page,
                last_read_date = :last_read_date,
                streak_count = :streak
            WHERE id = :book_id AND user_id = :user_id
        """),
        {"current_page": current_page, "last_read_date": last_read_date,
         "streak": streak, "book_id": book_id, "user_id": user_id},
    )


def handle_challenges(session, user_id, pages_read, book_id, old_page, new_page):
    today         = date.today()
    current_month = today.strftime("%Y-%m")

    challenge = session.execute(
        text("""
            SELECT daily_completed, daily_date, monthly_completed_books, current_month
            FROM user_challenges WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    ).mappings().fetchone()

    if challenge is None:
        session.execute(
            text("""
                INSERT INTO user_challenges
                    (user_id, daily_completed, daily_date, monthly_completed_books, current_month)
                VALUES (:user_id, FALSE, NULL, 0, :current_month)
            """),
            {"user_id": user_id, "current_month": current_month},
        )
        daily_completed, daily_date, monthly_books, saved_month = False, None, 0, current_month
    else:
        daily_completed = challenge["daily_completed"]
        daily_date      = challenge["daily_date"]
        monthly_books   = challenge["monthly_completed_books"]
        saved_month     = challenge["current_month"]

    if daily_date != today:      daily_completed = False
    if saved_month != current_month:
        monthly_books = 0
        saved_month   = current_month
    if pages_read >= 20:
        daily_completed = True
        daily_date      = today

    if new_page > old_page:
        row = session.execute(
            text("SELECT total_pages FROM books WHERE id = :book_id AND user_id = :user_id"),
            {"book_id": book_id, "user_id": user_id},
        ).mappings().fetchone()
        if row and old_page < row["total_pages"] <= new_page:
            monthly_books += 1

    session.execute(
        text("""
            UPDATE user_challenges
            SET daily_completed = :daily_completed,
                daily_date = :daily_date,
                monthly_completed_books = :monthly_books,
                current_month = :current_month
            WHERE user_id = :user_id
        """),
        {"daily_completed": daily_completed, "daily_date": daily_date,
         "monthly_books": monthly_books, "current_month": saved_month, "user_id": user_id},
    )


def log_reading_session(session, book_id, pages_read):
    if pages_read > 0:
        session.execute(
            text("INSERT INTO reading_sessions (book_id, pages_read) VALUES (:book_id, :pages_read)"),
            {"book_id": book_id, "pages_read": pages_read},
        )


def update_global_streak(session, user_id, pages_read):
    today     = date.today()
    qualified = pages_read >= MIN_PAGES_FOR_STREAK

    g = session.execute(
        text("""
            SELECT last_read_date, streak_count, freeze_count
            FROM user_streak WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    ).mappings().fetchone()

    if g is None:
        session.execute(
            text("""
                INSERT INTO user_streak (user_id, last_read_date, streak_count, freeze_count)
                VALUES (:user_id, NULL, 0, 2)
            """),
            {"user_id": user_id},
        )
        g_last, g_streak, g_freeze = None, 0, 2
    else:
        g_last   = g["last_read_date"]
        g_streak = g["streak_count"]
        g_freeze = g["freeze_count"]
        if g_last and not isinstance(g_last, date):
            g_last = date.fromisoformat(str(g_last))

    gap = (today - g_last).days if g_last else 0

    if pages_read <= 0:
        return g_streak, g_freeze

    if g_last and gap > 1:
        if gap == 2 and g_freeze > 0:  g_freeze -= 1
        else:                           g_streak  = 0

    if qualified:
        if g_last is None or g_streak == 0:  new_streak = 1
        elif g_last == today:                 new_streak = max(1, g_streak)
        elif gap == 1:                        new_streak = g_streak + 1
        elif gap == 2:                        new_streak = g_streak + 1 if g_streak > 0 else 1
        else:                                 new_streak = 1

        new_last = today
        if new_streak in (7, 30, 100):
            g_freeze += 1
    else:
        new_streak = g_streak
        new_last   = g_last

    session.execute(
        text("""
            UPDATE user_streak
            SET last_read_date = :last_read_date,
                streak_count = :streak_count,
                freeze_count = :freeze_count
            WHERE user_id = :user_id
        """),
        {"last_read_date": new_last, "streak_count": new_streak,
         "freeze_count": g_freeze, "user_id": user_id},
    )

    return new_streak, g_freeze