"""Description of changes

Revision ID: 7cdca7aab692
Revises: 0c2631ac500d
Create Date: 2026-07-04 00:03:15.559949

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str ='7cdca7aab692'
down_revision: Union[str, Sequence[str], None] = '0c2631ac500d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("""
        CREATE SEQUENCE IF NOT EXISTS user_challenges_id_seq
        OWNED BY user_challenges.id
    """)
    op.execute("""
        SELECT setval('user_challenges_id_seq', COALESCE((SELECT MAX(id) FROM user_challenges), 1))
    """)
    op.execute("""
        ALTER TABLE user_challenges
        ALTER COLUMN id SET DEFAULT nextval('user_challenges_id_seq')
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE user_challenges ALTER COLUMN id DROP DEFAULT")
    op.execute("DROP SEQUENCE IF EXISTS user_challenges_id_seq")
    # ### end Alembic commands ###
