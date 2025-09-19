# backend/utils/chunking.py
import re

def chunk_text(text, chunk_size=300, overlap=50):
    """Splits text into overlapping chunks."""
    words = re.split(r"\s+", text)
    chunks, i = [], 0
    while i < len(words):
        chunk = words[i:i+chunk_size]
        chunks.append(" ".join(chunk))
        i += chunk_size - overlap
    return chunks
