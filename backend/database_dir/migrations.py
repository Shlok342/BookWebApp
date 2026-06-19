def do_migrations(cursor):
    cursor.execute("""
            ALTER TABLE books
            ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]'
            """)
                
        
    cursor.execute("""DO $$
            BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'valid_streak'
            ) THEN
                ALTER TABLE user_streak
                ADD CONSTRAINT valid_streak
                CHECK (
                (last_read_date IS NULL AND streak_count = 0)
                 OR (last_read_date IS NOT NULL AND streak_count >= 1)
                );
                END IF;
            END $$;""")
    cursor.execute("""
            ALTER TABLE books
                ADD COLUMN IF NOT EXISTS last_read_date DATE DEFAULT NULL
            """)
    cursor.execute("""
            ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url TEXT DEFAULT '';
            """)
            
    cursor.execute("ALTER TABLE books ADD COLUMN IF NOT EXISTS genre TEXT DEFAULT ''")
            
            

    cursor.execute("""
            ALTER TABLE books
                ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0
            """)

    cursor.execute("""
            ALTER TABLE books
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """)
    cursor.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='user_streak' AND column_name='freeze_count'
            ) THEN
                ALTER TABLE user_streak ADD COLUMN freeze_count INTEGER DEFAULT 2;
            END IF;
        END $$;
        """)

    cursor.execute("""
        ALTER TABLE books
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
        """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id)
        """)

    cursor.execute("""
        ALTER TABLE user_streak
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
        """)
    cursor.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS user_streak_user_id_unique
        ON user_streak(user_id) WHERE user_id IS NOT NULL
        """)

    cursor.execute("""
        ALTER TABLE user_challenges
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
        """)
    cursor.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS user_challenges_user_id_unique
        ON user_challenges(user_id) WHERE user_id IS NOT NULL
        """)

