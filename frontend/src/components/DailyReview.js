// frontend/src/components/DailyReview.js
// import React, { useEffect, useState } from "react";
// import { getDailyReview, submitReview } from "../api";

// export default function DailyReview({ user }) {
//   const [cards, setCards] = useState([]);
//   const [current, setCurrent] = useState(0);
//   const [showAnswer, setShowAnswer] = useState(false);

//   useEffect(() => {
//     async function fetchCards() {
//       const data = await getDailyReview(user.id);
//       setCards(data);
//     }
//     fetchCards();
//   }, [user]);

//   if (cards.length === 0) {
//     return (
//       <p className="text-center mt-6 text-green-600 font-bold">
//         🎉 No cards to review today. Come back tomorrow!
//       </p>
//     );
//   }

//   const card = cards[current];

//   const handleAnswer = async (correct) => {
//     await submitReview(user.id, card.id, correct);
//     if (current + 1 < cards.length) {
//       setCurrent(current + 1);
//       setShowAnswer(false);
//     } else {
//       setCards([]);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md text-center">
//       <h3 className="text-xl font-bold mb-4">
//         Daily Review {current + 1} / {cards.length}
//       </h3>
//       <p className="text-lg">{showAnswer ? card.answer : card.question}</p>

//       <div className="flex justify-between mt-6">
//         <button
//           onClick={() => setShowAnswer(!showAnswer)}
//           className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
//         >
//           {showAnswer ? "Show Question" : "Show Answer"}
//         </button>

//         {showAnswer && (
//           <div className="flex gap-2">
//             <button
//               onClick={() => handleAnswer(false)}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               Wrong
//             </button>
//             <button
//               onClick={() => handleAnswer(true)}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//             >
//               Correct
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// frontend/src/components/DailyReview.js
import React, { useEffect, useState } from "react";
import { getDailyReview, submitReview } from "../api";

export default function DailyReview({ user }) {
  const [todayCards, setTodayCards] = useState([]);
  const [catchupCards, setCatchupCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mode, setMode] = useState("today"); // today or catchup

  useEffect(() => {
    async function fetchCards() {
      const data = await getDailyReview(user.id);
      setTodayCards(data.today || []);
      setCatchupCards(data.catchup || []);
    }
    fetchCards();
  }, [user]);

  const cards = mode === "today" ? todayCards : catchupCards;

  if (cards.length === 0 && mode === "today" && catchupCards.length > 0) {
    return (
      <div className="text-center mt-6">
        <p className="mb-4">✅ Today’s session complete!</p>
        <button
          onClick={() => { setMode("catchup"); setCurrent(0); }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Catch Up on Yesterday
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <p className="text-center mt-6 text-green-600 font-bold">
        🎉 All reviews done! Come back tomorrow.
      </p>
    );
  }

  const card = cards[current];

  const handleAnswer = async (correct) => {
    await submitReview(user.id, card.id, correct);
    if (current + 1 < cards.length) {
      setCurrent(current + 1);
      setShowAnswer(false);
    } else {
      if (mode === "today" && catchupCards.length > 0) {
        setMode("catchup");
        setCurrent(0);
      } else {
        setTodayCards([]);
        setCatchupCards([]);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md text-center">
      <h3 className="text-xl font-bold mb-4">
        {mode === "today" ? "Today’s Review" : "Catch-Up Review"}{" "}
        {current + 1} / {cards.length}
      </h3>
      <p className="text-lg">{showAnswer ? card.answer : card.question}</p>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
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
