"""Fix user_streak sequence

Revision ID: 1b4abcf6202e
Revises: 7cdca7aab692
Create Date: 2026-07-04
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1b4abcf6202e"
down_revision: Union[str, Sequence[str], None] = "7cdca7aab692"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Remove any incorrect default first
    op.execute("""
        ALTER TABLE user_streak
        ALTER COLUMN id DROP DEFAULT
    """)

    # Remove any broken sequence
    op.execute("""
        DROP SEQUENCE IF EXISTS user_streak_id_seq CASCADE
    """)

    # Create a fresh sequence
    op.execute("""
        CREATE SEQUENCE user_streak_id_seq
    """)

    # Make the sequence owned by the id column
    op.execute("""
        ALTER SEQUENCE user_streak_id_seq
        OWNED BY user_streak.id
    """)

    # Attach the sequence to the id column
    op.execute("""
        ALTER TABLE user_streak
        ALTER COLUMN id
        SET DEFAULT nextval('user_streak_id_seq'::regclass)
    """)

    # Synchronize the sequence with existing rows
    op.execute("""
        SELECT setval(
            'user_streak_id_seq',
            COALESCE((SELECT MAX(id) FROM user_streak), 1),
            true
        )
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE user_streak
        ALTER COLUMN id DROP DEFAULT
    """)

    op.execute("""
        DROP SEQUENCE IF EXISTS user_streak_id_seq CASCADE
    """)