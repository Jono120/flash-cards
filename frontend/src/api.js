// frontend/src/api.js
// Allow overriding API base via env for local/prod flexibility
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000"; // FastAPI backend

export async function uploadFile(file, userId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const response = await fetch(`${API_BASE}/upload/`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function getFlashcards(userId) {
  const response = await fetch(`${API_BASE}/flashcards/${userId}`);
  return response.json();
}

export async function submitReview(userId, flashcardId, correct) {
  const response = await fetch(`${API_BASE}/review/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, flashcard_id: flashcardId, correct }),
  });
  return response.json();
}

export async function getHistory(userId) {
  const response = await fetch(`${API_BASE}/history/${userId}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
}

export async function getDashboard(userId) {
  const response = await fetch(`${API_BASE}/dashboard/${userId}`);
  return response.json();
}

export async function getDailyReview(userId) {
  const response = await fetch(`${API_BASE}/daily/${userId}`);
  return response.json();
}

export async function setHoliday(userId, start, end) {
  const response = await fetch(`${API_BASE}/holiday/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, start_date: start, end_date: end }),
  });
  return response.json();
}

export async function checkHoliday(userId) {
  const response = await fetch(`${API_BASE}/holiday/${userId}`);
  return response.json();
}

export async function extendHoliday(userId, days) {
  const response = await fetch(`${API_BASE}/holiday/extend/${userId}?extra_days=${days}`, {
    method: "POST",
  });
  return response.json();
}

export async function setSkipCatchup(userId, skip) {
  const response = await fetch(`${API_BASE}/holiday/skip/${userId}?skip=${skip}`, {
    method: "POST",
  });
  return response.json();
}