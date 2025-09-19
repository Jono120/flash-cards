# backend/utils/generator.py
import requests

def generate_flashcards_from_chunks(chunks, user_id):
    flashcards = []
    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"  # Replace with your actual Gemini API key
    headers = {"Content-Type": "application/json"}
    for chunk in chunks:
        prompt = f"Create concise question-answer flashcards from this study material:\n\n{chunk}"
        data = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=data
        )
        if response.status_code == 200:
            result = response.json()
            # Gemini returns generated text in result['candidates'][0]['content']['parts'][0]['text']
            try:
                text = result['candidates'][0]['content']['parts'][0]['text']
                qa_pairs = text.split("\n")
                for qa in qa_pairs:
                    if "?" in qa:
                        q, a = qa.split("?", 1)
                        flashcards.append({"question": q.strip() + "?", "answer": a.strip()})
            except Exception:
                continue
        else:
            continue
    return flashcards
