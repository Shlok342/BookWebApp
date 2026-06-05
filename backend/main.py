import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from backend.database import init_db
from backend.routers.core_books import router as core_book_functionality
from backend.routers.streak import router as streak_router
from backend.routers.stats import router as stat_router 
from backend.routers.book_update import router as books_router
from backend.routers.challenges import router as challenges_router
from backend.routers.quotes import router as quote_router
BASE_DIR = Path(__file__).resolve().parent
from backend.routers.heatmap_router import router as heatmap_router
TEMPLATES_DIR = BASE_DIR / "static" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

app=FastAPI()
# Standard FastAPI explicit decorators for both methods
@app.get("/healthz")
@app.head("/healthz")
def health_check():
    """Guaranteed to match before any sub-routers or file mounts interfere."""
    return {"status": "healthy"}
app.include_router(heatmap_router)
app.include_router(stat_router)
app.include_router(streak_router)    
app.include_router(books_router)
app.include_router(core_book_functionality)
app.include_router(challenges_router)
app.include_router(quote_router)
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
def home(request: Request):
    return templates.TemplateResponse(request, "index.html")


@app.get("/test")
def test():
    return {"files": os.listdir()}


