from datetime import date
from fastapi import HTTPException
from backend.database import get_connection
from psycopg2.extras import RealDictCursor

MIN_PAGES_FOR_STREAK = 2
def compute_qualified(pages_read: int) -> bool:
    return pages_read >= MIN_PAGES_FOR_STREAK

# ─── MAIN SERVICE FUNCTION ─────────────────────────────────────────────
def update_progress_service(book_id: int, update):
    with get_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # ── 1. Get book ──
        book = get_book(cursor, book_id)
        book = get_book(cursor, book_id)

        if update.current_page < 0:
            raise HTTPException(400, "Page cannot be negative")

        if update.current_page > book["total_pages"]:
            update.current_page = book["total_pages"]   # clamp instead of error

        # ── 2. Calculate pages read ──
        pages_read = calculate_pages_read(book["current_page"], update.current_page)
        qualified = pages_read >= MIN_PAGES_FOR_STREAK

        # ── 3. Update per-book streak ──
        new_streak, new_last_read = update_streak_logic(
            book["last_read_date"],
            book["streak_count"],
            pages_read
        )

        # ── 4. Update book ──
        update_book(cursor, book_id, update.current_page, new_last_read, new_streak)

        # ── 5. Challenges ──
        handle_challenges(cursor, pages_read, book_id, book["current_page"], update.current_page)

        # ── 6. Reading session ──
        log_reading_session(cursor, book_id, pages_read)

        # ── 7. Global streak ──
        global_streak, freeze_count = update_global_streak(cursor, pages_read)

        conn.commit()

    return {
        "message": "Progress updated",
        "pages_logged": pages_read,
        "streak_count": new_streak,
        "global_streak": global_streak,
        "freeze_count": freeze_count, 
        "qualified_for_streak": qualified
        
    }


# ─── HELPERS ───────────────────────────────────────────────────────────

def get_book(cursor, book_id):
    cursor.execute(
        "SELECT current_page, last_read_date, streak_count, total_pages FROM books WHERE id = %s",
        (book_id,)
    )
    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Book not found")

    current_page = row["current_page"]
    last_read_date = row["last_read_date"]
    streak_count = row["streak_count"]

    if last_read_date and not isinstance(last_read_date, date):
        last_read_date = date.fromisoformat(str(last_read_date))

    return {
        "current_page": current_page,
        "last_read_date": last_read_date,
        "streak_count": streak_count, 
        "total_pages": row["total_pages"]
    }

def calculate_pages_read(old, new):
    return max(0, new - old)


def update_streak_logic(last_read_date, streak_count, pages_read):
    today = date.today()
    qualified = pages_read >= MIN_PAGES_FOR_STREAK

    if not qualified:
        return streak_count, last_read_date

    if last_read_date is None:
        return 1, today

    if last_read_date == today:
        return streak_count, today

    if (today - last_read_date).days == 1:
        return streak_count + 1, today

    return 1, today


def update_book(cursor, book_id, current_page, last_read_date, streak):
    cursor.execute(
        """
        UPDATE books
        SET current_page = %s,
            last_read_date = %s,
            streak_count = %s
        WHERE id = %s
        """,
        (current_page, last_read_date, streak, book_id)
    )


# ─── CHALLENGES ────────────────────────────────────────────────────────

def handle_challenges(cursor, pages_read, book_id, old_page, new_page):
    today = date.today()
    today_str = today.isoformat()
    current_month = today.strftime("%Y-%m")

    cursor.execute(
        "SELECT daily_completed, daily_date, monthly_completed_books, current_month FROM user_challenges WHERE id = 1"
    )
    challenge = cursor.fetchone()

    if challenge is None:
        cursor.execute("""
            INSERT INTO user_challenges (id, daily_completed, daily_date, monthly_completed_books, current_month)
            VALUES (1, FALSE, NULL, 0, %s)
        """, (current_month,))
        daily_completed, daily_date, monthly_books, saved_month = False, None, 0, current_month
    else:
        daily_completed = challenge["daily_completed"]
        daily_date = challenge["daily_date"]
        monthly_books = challenge["monthly_completed_books"]
        saved_month = challenge["current_month"]

    # reset
    if daily_date != today:
        daily_completed = False

    if saved_month != current_month:
        monthly_books = 0
        saved_month = current_month

    # daily challenge
    if pages_read >= 20:
        daily_completed = True
        daily_date = today

    # monthly challenge
    if new_page > old_page:
        cursor.execute("SELECT total_pages FROM books WHERE id = %s", (book_id,))
        total_pages = cursor.fetchone()["total_pages"]

        if old_page < total_pages and new_page >= total_pages:
            monthly_books += 1

    cursor.execute("""
        UPDATE user_challenges
        SET daily_completed = %s,
            daily_date = %s,
            monthly_completed_books = %s,
            current_month = %s
        WHERE id = 1
    """, (daily_completed, daily_date, monthly_books, saved_month))


# ─── READING SESSION ───────────────────────────────────────────────────

def log_reading_session(cursor, book_id, pages_read):
    if pages_read > 0:
        cursor.execute(
            "INSERT INTO reading_sessions (book_id, pages_read) VALUES (%s, %s)",
            (book_id, pages_read)
        )


# ─── GLOBAL STREAK ─────────────────────────────────────────────────────

def update_global_streak(cursor, pages_read):
    today = date.today()
    qualified = pages_read >= MIN_PAGES_FOR_STREAK

    cursor.execute(
        "SELECT last_read_date, streak_count, freeze_count FROM user_streak WHERE id = 1"
    )
    g = cursor.fetchone()

    if g is None:
        cursor.execute(
            "INSERT INTO user_streak (id, last_read_date, streak_count, freeze_count) VALUES (1, NULL, 0, 2)"
        )
        g_last, g_streak, g_freeze = None, 0, 2
    else:
        # ✅ Correct
        g_last = g["last_read_date"]
        g_streak = g["streak_count"]
        g_freeze = g["freeze_count"]

        if g_last and not isinstance(g_last, date):
            g_last = date.fromisoformat(str(g_last))

    gap = (today - g_last).days if g_last else 0

    # handle missed days
    if g_last and gap > 1:
        if g_freeze > 0:
            g_freeze -= 1
        else:
            g_streak = 0

    if qualified:
        if g_last is None:
            new_streak = 1
        elif g_last == today:
            new_streak = g_streak
        elif gap == 1:
            new_streak = g_streak + 1
        else:
            new_streak = g_streak

        new_last = today
    else:
        new_streak = g_streak
        new_last = g_last

    cursor.execute(
        """
        UPDATE user_streak
        SET last_read_date = %s,
            streak_count = %s,
            freeze_count = %s
        WHERE id = 1
        """,
        (new_last, new_streak, g_freeze)
    )

    return new_streak, g_freeze