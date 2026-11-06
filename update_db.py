from backend.database import engine

with engine.connect() as connection:
    connection.exec_driver_sql("""
        ALTER TABLE chat_history
        ADD COLUMN IF NOT EXISTS customer_id INTEGER;
    """)

    connection.commit()

print("Database table updated successfully!")