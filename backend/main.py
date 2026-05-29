import os
import json
import asyncio
import urllib.request
from pathlib import Path
from datetime import date
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from psycopg2.extras import RealDictCursor
from backend.database import init_db
from backend.routers.delete_add_get_books import router as core_book_functionality
from backend.db.connection import get_db
from backend.routers.streak import router as streak_router
from backend.routers.stats import router as stat_router 
from backend.routers.book_update import router as books_router
BASE_DIR = Path(__file__).resolve().parent

app=FastAPI()
app.include_router(stat_router)
app.include_router(streak_router)
app.include_router(books_router)
app.include_router(core_book_functionality)
app.mount("/static", StaticFiles(directory=BASE_DIR/"static"), name="static")
init_db()

origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    """Browsers request /favicon.ico by default; serve SVG so logs stay clean of 404 noise."""
    return FileResponse(
        BASE_DIR / "static" / "favicon.svg",
        media_type="image/svg+xml",
    )


@app.get("/")
def home():
    return FileResponse(BASE_DIR / "static" / "index.html")

# ─── GET GLOBAL STREAK ───────────────────────────────────────────────────────
@app.get("/challenges")
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
@app.get("/quote")
async def get_quote():
    def _fetch_quote():
        req = urllib.request.Request(
            "https://zenquotes.io/api/today",
            headers={"User-Agent": "BookWebApp/1.0"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode())

    try:
        data = await asyncio.to_thread(_fetch_quote)

        if not data or "q" not in data[0]:
            raise ValueError("Invalid API response")

        return {
            "quote": data[0].get("q", "No quote"),
            "author": data[0].get("a", "Unknown")
        }

    except Exception as e:
        print("Quote fetch failed:", e)  # 👈 useful for debugging
        return {
            "quote": "A reader lives a thousand lives before he dies.",
            "author": "George R.R. Martin"
        }

@app.get("/test")
def test():
    return {"files": os.listdir()}