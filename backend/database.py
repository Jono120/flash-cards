# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Load environment variables from .env for local development
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # If python-dotenv isn't available for some reason, continue without it
    pass

# Use DATABASE_URL from environment if present; otherwise default to a local sqlite file
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./flashcards.db")

# For sqlite, disable the check_same_thread flag which is required when using SQLAlchemy
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Reusable dependency provider
from contextlib import contextmanager

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
