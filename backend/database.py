# 💡 Import get_db instead of get_connection
from backend.db.connection import get_db 
from backend.database_dir.create_table import create_tables
from backend.database_dir.migrations import do_migrations
from backend.database_dir.do_indices import do_indices
from backend.database_dir.do_insertion import do_insertion

def init_db():
    # 💡 Use get_db() here so the context manager safely opens & closes the line
    with get_db() as conn:
        with conn.cursor() as cursor:
            # ─── BOOKS TABLE ─────────────────────────────────────────
            create_tables(cursor)
            do_migrations(cursor)
            do_indices(cursor)
            do_insertion(cursor)
