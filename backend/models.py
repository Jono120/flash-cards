# backend/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

    flashcards = relationship("Flashcard", back_populates="owner")

class Flashcard(Base):
    __tablename__ = "flashcards"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String)
    answer = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    box = Column(Integer, default=1)
    last_reviewed = Column(Date, nullable=True)

    owner = relationship("User", back_populates="flashcards")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"))
    correct = Column(Integer)  # 1 = correct, 0 = wrong
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    flashcard = relationship("Flashcard")

class Holiday(Base):
    __tablename__ = "holidays"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    skip_catchup = Column(Boolean, default=False)
    
    user = relationship("User")
