from backend.db.connection import get_connection
from backend.database_dir.create_table import create_tables
from backend.database_dir.migrations import do_migrations
from backend.database_dir.do_indices import do_indices
from backend.database_dir.do_insertion import do_insertion
def init_db():
    with get_connection() as conn:
        with conn.cursor() as cursor:
    

    # ─── BOOKS TABLE ─────────────────────────────────────────
            create_tables(cursor)
            do_migrations(cursor)
            do_indices(cursor)
            do_insertion(cursor)