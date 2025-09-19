# backend/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date, timedelta

def get_flashcards_by_user(db: Session, user_id: int):
    return db.query(models.Flashcard).filter(models.Flashcard.user_id == user_id).all()

def create_flashcard(db: Session, flashcard: schemas.FlashcardCreate, user_id: int):
    db_flashcard = models.Flashcard(**flashcard.dict(), user_id=user_id)
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard

def create_review(db: Session, review: schemas.ReviewCreate):
    db_review = models.Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_user_history(db: Session, user_id: int):
    return db.query(models.Review).filter(models.Review.user_id == user_id).all()

def get_mastered_count(db: Session, user_id: int):
    return db.query(models.Flashcard).filter(
        models.Flashcard.user_id == user_id, models.Flashcard.box == 3
    ).count()

def get_daily_cards(db: Session, user_id: int, limit: int = 20):
    today = date.today()
    flashcards = db.query(models.Flashcard).filter(models.Flashcard.user_id == user_id).all()
    
    eligible = []
    for card in flashcards:
        if card.box == 1:
            eligible.append(card)
        elif card.box == 2 and today.toordinal() % 2 == 0:
            eligible.append(card)
        elif card.box == 3 and today.toordinal() % 3 == 0:
            eligible.append(card)
    
    # Shuffle and limit
    import random
    random.shuffle(eligible)
    return eligible[:limit]

def get_last_study_date(db: Session, user_id: int):
    last_review = db.query(models.Review).filter(
        models.Review.user_id == user_id
    ).order_by(models.Review.timestamp.desc()).first()
    return last_review.timestamp.date() if last_review else None


def get_catchup_cards(db: Session, user_id: int, limit: int = 20):
    today = date.today()
    last_date = get_last_study_date(db, user_id)
    if not last_date:
        return []  # new user, no catch-up needed

    missed_days = (today - last_date).days - 1
    if missed_days <= 0:
        return []  # no missed days
    
    holiday = get_active_holiday(db, user_id)
    if holiday and holiday.skip_catchup:
        return []  # skip catch-up during holiday
    if is_on_holiday(db, user_id):
        return []  # skip catch-up during holiday

    # Collect yesterday's eligible cards
    yesterday = today - timedelta(days=1)
    all_cards = db.query(models.Flashcard).filter(models.Flashcard.user_id == user_id).all()

    catchup = []
    for card in all_cards:
        if card.box == 1:
            catchup.append(card)
        elif card.box == 2 and yesterday.toordinal() % 2 == 0:
            catchup.append(card)
        elif card.box == 3 and yesterday.toordinal() % 3 == 0:
            catchup.append(card)

    today = date.today()
    last_date = get_last_study_date(db, user_id)
    if not last_date:
        return []

    missed_days = (today - last_date).days - 1
    if missed_days <= 0:
        return []        

    # Shuffle & limit
    import random
    random.shuffle(catchup)
    return catchup[:limit]

def set_holiday(db: Session, user_id: int, start_date: date, end_date: date):
    holiday = models.Holiday(user_id=user_id, start_date=start_date, end_date=end_date)
    db.add(holiday)
    db.commit()
    db.refresh(holiday)
    return holiday

def get_active_holiday(db: Session, user_id: int):
    today = date.today()
    return db.query(models.Holiday).filter(
        models.Holiday.user_id == user_id,
        models.Holiday.start_date <= today,
        models.Holiday.end_date >= today
    ).first()

def is_on_holiday(db: Session, user_id: int) -> bool:
    return get_active_holiday(db, user_id) is not None

def extend_holiday(db: Session, user_id: int, extra_days: int):
    holiday = get_active_holiday(db, user_id)
    if holiday:
        holiday.end_date += timedelta(days=extra_days)
        db.commit()
        db.refresh(holiday)
    return holiday

def set_skip_catchup(db: Session, user_id: int, skip: bool):
    holiday = get_active_holiday(db, user_id)
    if holiday:
        holiday.skip_catchup = skip
        db.commit()
        db.refresh(holiday)
    return holiday

def get_active_holiday(db: Session, user_id: int):
    today = date.today()
    holiday = db.query(models.Holiday).filter(
        models.Holiday.user_id == user_id,
        models.Holiday.start_date <= today,
        models.Holiday.end_date >= today
    ).first()

    if holiday:
        holiday.days_left = (holiday.end_date - today).days + 1
    return holiday