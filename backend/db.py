import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Always load .env from this backend folder
CURRENT_DIR = os.path.dirname(__file__)
DOTENV_PATH = os.path.join(CURRENT_DIR, ".env")
print(f"Loading env from: {DOTENV_PATH} (exists={os.path.exists(DOTENV_PATH)})")
load_dotenv(dotenv_path=DOTENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL loaded: {('None' if not DATABASE_URL else DATABASE_URL.split('://')[0] + '://***')} ")

# Fallback to SQLite if DATABASE_URL is not set yet
if not DATABASE_URL:
    # Use SQLite for simplicity - no external database required
    DATABASE_URL = "sqlite:///./agronova_dev.db"
    print("DATABASE_URL not set; using SQLite database (agronova_dev.db)")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
print(f"DB connected: {'Postgres' if 'postgresql' in DATABASE_URL or 'psycopg' in DATABASE_URL else 'SQLite'} -> {DATABASE_URL}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 