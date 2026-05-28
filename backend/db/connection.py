import os
from psycopg2 import connect
from dotenv import load_dotenv
from pathlib import Path
from contextlib import contextmanager

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

def get_connection():
    return connect(os.getenv("DATABASE_URL"))

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()