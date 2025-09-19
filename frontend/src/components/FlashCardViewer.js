// frontend/src/components/FlashcardViewer.js
import React, { useEffect, useMemo, useState } from "react";
import { submitReview } from "../api";

export default function FlashcardViewer({ flashcards, user }) {
  // Memoize an initial set to avoid recomputing on every render
  const initialCards = useMemo(() => flashcards || [], [flashcards]);

  // Leitner boxes state
  const [boxes, setBoxes] = useState({ 1: [], 2: [], 3: [] });
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  // Reset boxes when incoming flashcards change
  useEffect(() => {
    const box1 = initialCards.map((c) => ({ ...c, box: 1 }));
    setBoxes({ 1: box1, 2: [], 3: [] });
    setCurrentCard(box1[0] || null);
    setShowAnswer(false);
    setSessionCount(1);
  }, [initialCards]);

  if (!initialCards || initialCards.length === 0) {
    return <p className="text-center mt-6 text-gray-600">No flashcards yet.</p>;
  }

  const moveCard = (card, correct) => {
    setBoxes((prev) => {
      const next = { 1: [...prev[1]], 2: [...prev[2]], 3: [...prev[3]] };
      next[card.box] = next[card.box].filter((c) => c.id !== card.id);
      if (correct) {
        const nextBox = Math.min(card.box + 1, 3);
        next[nextBox].push({ ...card, box: nextBox });
      } else {
        next[1].push({ ...card, box: 1 });
      }
      return next;
    });
  };

  const getNextCard = (countNext) => {
    // Decide which box to pull from based on the session count
    const count = countNext ?? sessionCount;
    let candidates = [];
    setShowAnswer(false);

    setBoxes((prev) => {
      if (count % 3 === 0 && prev[3].length > 0) candidates = prev[3];
      else if (count % 2 === 0 && prev[2].length > 0) candidates = prev[2];
      else candidates = prev[1];
      return prev;
    });

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const handleAnswer = async (correct) => {
    try {
      if (user?.id && currentCard?.id) {
        await submitReview(user.id, currentCard.id, correct);
      }
    } catch (e) {
      // Non-fatal: allow local session to proceed
      // eslint-disable-next-line no-console
      console.error("Failed to submit review", e);
    }

    if (!currentCard) return;

    moveCard(currentCard, correct);
    const next = getNextCard(sessionCount + 1);
    if (next) {
      setCurrentCard(next);
      setShowAnswer(false);
      setSessionCount((c) => c + 1);
    } else {
      setCurrentCard(null);
    }
  };

  if (!currentCard) {
    return (
      <p className="text-center mt-6 text-green-600 font-bold">
        🎉 You’ve completed today’s review session!
      </p>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md text-center">
      <h3 className="text-xl font-bold mb-4">Flashcard Review</h3>
      <p className="text-lg">{showAnswer ? currentCard.answer : currentCard.question}</p>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setShowAnswer((s) => !s)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          {showAnswer ? "Show Question" : "Show Answer"}
        </button>

        {showAnswer && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAnswer(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Wrong
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Correct
            </button>
          </div>
        )}
      </div>
    </div>
  );
}