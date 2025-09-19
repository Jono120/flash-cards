# backend/utils/flashcards.py
import os
import json
import requests
from fastapi import UploadFile
from sqlalchemy.orm import Session
from .. import crud, schemas

# Load API key from environment for local dev
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def _extract_text_sync(file: UploadFile) -> str:
    """Extracts text by saving to disk and using typed extractors."""
    # Lazy import to avoid hard dependency at module import time
    from . import extractors  # type: ignore

    filename = file.filename.lower()
    contents = file.file.read()
    temp_path = f"uploads/_tmp_{os.getpid()}_{os.path.basename(filename)}"
    os.makedirs(os.path.dirname(temp_path), exist_ok=True)
    with open(temp_path, "wb") as f:
        f.write(contents)

    try:
        if filename.endswith(".pdf"):
            return extractors.extract_pdf(temp_path)
        if filename.endswith(".docx"):
            return extractors.extract_docx(temp_path)
        if filename.endswith(".pptx"):
            return extractors.extract_pptx(temp_path)
        return contents.decode("utf-8", errors="ignore")
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass


def chunk_text(text: str, max_chars: int = 2000) -> list[str]:
    sentences = text.split(". ")
    chunks, current = [], ""
    for sentence in sentences:
        if len(current) + len(sentence) < max_chars:
            current += sentence + ". "
        else:
            if current:
                chunks.append(current.strip())
            current = sentence + ". "
    if current:
        chunks.append(current.strip())
    return chunks


def parse_flashcards_from_response(content: str):
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start, end = content.find("["), content.rfind("]") + 1
        if start != -1 and end != -1:
            try:
                return json.loads(content[start:end])
            except Exception:
                return []
    return []


def generate_flashcards_from_chunk(chunk: str):
    if not GEMINI_API_KEY:
        # In local dev, allow running without external API by returning empty
        return []

    headers = {"Content-Type": "application/json"}
    prompt = f"""
                Create up to 5 flashcards from this text.
                Return ONLY JSON in this format:
                [
                  {{"question": "Q1", "answer": "A1"}},
                  {{"question": "Q2", "answer": "A2"}}
                ]

                Text:
                {chunk}
                """

    data = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}", headers=headers, json=data, timeout=30
        )
        response.raise_for_status()
        result = response.json()
        content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return parse_flashcards_from_response(content)
    except Exception:
        return []


async def process_file(file: UploadFile, user_id: int, db: Session):
    text = _extract_text_sync(file)
    chunks = chunk_text(text)

    all_flashcards = []
    for chunk in chunks:
        qa_pairs = generate_flashcards_from_chunk(chunk)
        for qa in qa_pairs:
            if "question" in qa and "answer" in qa:
                flashcard = crud.create_flashcard(db, schemas.FlashcardCreate(**qa), user_id)
                all_flashcards.append(flashcard)

    return all_flashcards
