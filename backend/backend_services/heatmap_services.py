from backend.db.connection import get_db
from psycopg2.extras import RealDictCursor

def get_heatmap_data():
    with get_db() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT
                DATE(created_at) as day,
                SUM(pages_read) as total_pages
            FROM reading_sessions
            WHERE created_at >= CURRENT_DATE - INTERVAL '365 days'
            GROUP BY DATE(created_at)
            ORDER BY day
        """)

        rows = cursor.fetchall()

        return {
            "days": rows
        }