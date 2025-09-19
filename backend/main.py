# backend/main.py
from fastapi import FastAPI, UploadFile, Depends, HTTPException, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from . import models, crud, schemas
from .utils import flashcards as flashcard_service
from .schemas import ReviewCreate
from pydantic import BaseModel
from datetime import datetime
import os, shutil
from .utils.chunking import chunk_text

UPLOAD_DIR = "uploads"
FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "build")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Flashcard SaaS MVP")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# If build exists, serve it (lets users open http://localhost:8000/)
if os.path.isdir(FRONTEND_BUILD_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")

# Health endpoint for readiness checks
@app.get("/health")
def health():
    return {"status": "ok"}

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Primary upload endpoint that generates flashcards
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), user_id: int = Form(...), db: Session = Depends(get_db)):
    """
    Uploads a file, extracts text, and generates flashcards.
    """
    try:
        flashcards = await flashcard_service.process_file(file, user_id, db)
        return {"flashcards": flashcards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/flashcards/{user_id}")
def get_flashcards(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch all flashcards for a user.
    """
    return crud.get_flashcards_by_user(db, user_id)

@app.post("/review/")
def submit_review(review: ReviewCreate, db: Session = Depends(get_db)):
    return crud.create_review(db, review)

@app.get("/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user_history(db, user_id)

class HolidayRequest(BaseModel):
    user_id: int
    start_date: str
    end_date: str

@app.post("/holiday/")
def add_holiday(request: HolidayRequest, db: Session = Depends(get_db)):
    start = datetime.strptime(request.start_date, "%Y-%m-%d").date()
    end = datetime.strptime(request.end_date, "%Y-%m-%d").date()
    return crud.set_holiday(db, request.user_id, start, end)

@app.get("/holiday/{user_id}")
def check_holiday(user_id: int, db: Session = Depends(get_db)):
    return {"on_holiday": crud.is_on_holiday(db, user_id)}

# Add endpoints to extend and toggle catch-up skipping during holiday
@app.post("/holiday/extend/{user_id}")
def extend_holiday(user_id: int, extra_days: int, db: Session = Depends(get_db)):
    holiday = crud.extend_holiday(db, user_id, extra_days)
    if not holiday:
        raise HTTPException(status_code=404, detail="No active holiday to extend")
    return holiday

@app.post("/holiday/skip/{user_id}")
def set_skip_catchup(user_id: int, skip: bool, db: Session = Depends(get_db)):
    holiday = crud.set_skip_catchup(db, user_id, skip)
    if not holiday:
        raise HTTPException(status_code=404, detail="No active holiday to update")
    return holiday

# Enhanced dashboard endpoint (keep only this version)
@app.get("/dashboard/{user_id}")
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    history = crud.get_user_history(db, user_id)
    mastered = crud.get_mastered_count(db, user_id)
    holiday = crud.get_active_holiday(db, user_id)

    def calculate_streak(history):
        dates = sorted({h.timestamp.date() for h in history})
        streak = 0
        if dates:
            streak = 1
            for i in range(len(dates) - 1, 0, -1):
                if (dates[i] - dates[i-1]).days == 1:
                    streak += 1
                else:
                    break
        if crud.is_on_holiday(db, user_id):
            return 0
        return streak

    return {
        "history": history,
        "mastered": mastered,
        "streak": calculate_streak(history),
        "streak_status": "frozen" if holiday else "active",
        "holiday": holiday
    }

# Enhanced daily review endpoint (keep only this version)
@app.get("/daily/{user_id}")
def get_daily(user_id: int, db: Session = Depends(get_db)):
    today_cards = crud.get_daily_cards(db, user_id)
    catchup_cards = crud.get_catchup_cards(db, user_id)

    return {
        "today": today_cards,
        "catchup": catchup_cards,
        "missed_days": len(catchup_cards) > 0
    }

# Optional: chunk-only endpoint for debugging
@app.post("/upload/chunks")
async def upload_file_chunks(user_id: int = Form(...), file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text depending on file type
    if file.filename.endswith(".pdf"):
        from .utils.extractors import extract_pdf
        text = extract_pdf(file_path)
    elif file.filename.endswith(".docx"):
        from .utils.extractors import extract_docx
        text = extract_docx(file_path)
    elif file.filename.endswith(".pptx"):
        from .utils.extractors import extract_pptx
        text = extract_pptx(file_path)
    else:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

    # Chunk the text
    chunks = chunk_text(text)

    return {"chunks": chunks, "count": len(chunks)}