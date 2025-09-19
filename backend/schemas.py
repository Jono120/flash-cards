# backend/schemas.py
from pydantic import BaseModel
from pydantic import ConfigDict
from datetime import datetime

class FlashcardBase(BaseModel):
    question: str
    answer: str

class FlashcardCreate(FlashcardBase):
    pass

class Flashcard(FlashcardBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        model_config = ConfigDict(from_attributes=True)

class ReviewBase(BaseModel):
    flashcard_id: int
    correct: bool

class ReviewCreate(ReviewBase):
    user_id: int

class Review(ReviewBase):
    id: int
    timestamp: datetime

    class Config:
        model_config = ConfigDict(from_attributes=True)
