// frontend/src/components/HolidayManager.js
// import React, { useState, useEffect } from "react";
// import { setHoliday, checkHoliday } from "../api";

// export default function HolidayManager({ user }) {
//   const [onHoliday, setOnHoliday] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   useEffect(() => {
//     async function fetchHoliday() {
//       const res = await checkHoliday(user.id);
//       setOnHoliday(res.on_holiday);
//     }
//     fetchHoliday();
//   }, [user]);

//   const handleSetHoliday = async () => {
//     if (!startDate || !endDate) return;
//     await setHoliday(user.id, startDate, endDate);
//     setOnHoliday(true);
//   };

//   return (
//     <div className="max-w-md mx-auto mt-4 p-4 bg-white rounded-xl shadow-md text-center">
//       <h2 className="text-lg font-bold mb-2">🏖 Holiday Mode</h2>
//       {onHoliday ? (
//         <p className="text-green-600 font-semibold">
//           Your streak is currently frozen while on holiday.
//         </p>
//       ) : (
//         <>
//           <p className="mb-2 text-gray-600">
//             Set a date range to pause your streak.
//           </p>
//           <div className="flex gap-2 mb-3">
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="border rounded px-2 py-1"
//             />
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="border rounded px-2 py-1"
//             />
//           </div>
//           <button
//             onClick={handleSetHoliday}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Activate Holiday
//           </button>
//         </>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { setHoliday, checkHoliday } from "../api";

// export default function HolidayManager({ user, onClose }) {
//   const [onHoliday, setOnHoliday] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   useEffect(() => {
//     async function fetchHoliday() {
//       const res = await checkHoliday(user.id);
//       setOnHoliday(res.on_holiday);
//     }
//     fetchHoliday();
//   }, [user]);

//   const handleSetHoliday = async () => {
//     if (!startDate || !endDate) return;
//     await setHoliday(user.id, startDate, endDate);
//     setOnHoliday(true);
//     if (onClose) onClose();
//   };

//   return (
//     <div className="max-w-md mx-auto mt-4 p-4 bg-white rounded-xl shadow-md text-center">
//       <h2 className="text-lg font-bold mb-2">🏖 Manage Holiday</h2>
//       {onHoliday ? (
//         <p className="text-green-600 font-semibold">Your streak is frozen.</p>
//       ) : (
//         <>
//           <p className="mb-2 text-gray-600">Set a date range to pause streaks.</p>
//           <div className="flex gap-2 mb-3">
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="border rounded px-2 py-1"
//             />
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="border rounded px-2 py-1"
//             />
//           </div>
//           <button
//             onClick={handleSetHoliday}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Save Holiday
//           </button>
//         </>
//       )}
//       {onClose && (
//         <button
//           onClick={onClose}
//           className="mt-3 text-sm text-gray-600 underline"
//         >
//           Close
//         </button>
//       )}
//     </div>
//   );
// }

// frontend/src/components/HolidayManager.js
import React, { useState, useEffect } from "react";
import { setHoliday, checkHoliday, extendHoliday, setSkipCatchup } from "../api";

export default function HolidayManager({ user, onClose }) {
  const [onHoliday, setOnHoliday] = useState(false);
  const [holiday, setHolidayState] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchHoliday() {
      const res = await checkHoliday(user.id);
      setOnHoliday(res.on_holiday);
      if (res.on_holiday) setHolidayState(res); // holds start/end
    }
    fetchHoliday();
  }, [user]);

  const handleSetHoliday = async () => {
    if (!startDate || !endDate) return;
    const h = await setHoliday(user.id, startDate, endDate);
    setOnHoliday(true);
    setHolidayState(h);
    if (onClose) onClose();
  };

  const handleExtend = async (days) => {
    const h = await extendHoliday(user.id, days);
    setHolidayState(h);
  };

  const handleSkipCatchup = async (skip) => {
    const h = await setSkipCatchup(user.id, skip);
    setHolidayState(h);
  };

  return (
    <div className="max-w-md mx-auto mt-4 p-4 bg-white rounded-xl shadow-md text-center">
      <h2 className="text-lg font-bold mb-2">🏖 Manage Holiday</h2>

      {onHoliday ? (
        <>
          <p className="mb-2 text-green-600 font-semibold">
            Holiday Active: {holiday?.start_date} → {holiday?.end_date}
          </p>
          <div className="flex justify-center gap-2 mb-3">
            <button
              onClick={() => handleExtend(3)}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              ➕ Extend 3 days
            </button>
            <button
              onClick={() => handleExtend(7)}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              ➕ Extend 1 week
            </button>
          </div>
          <div className="mb-3">
            <label className="flex items-center gap-2 justify-center">
              <input
                type="checkbox"
                checked={holiday?.skip_catchup || false}
                onChange={(e) => handleSkipCatchup(e.target.checked)}
              />
              Skip catch-up after holiday
            </label>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2 text-gray-600">Set a date range to pause streaks.</p>
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            onClick={handleSetHoliday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Holiday
          </button>
        </>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="mt-3 text-sm text-gray-600 underline"
        >
          Close
        </button>
      )}
    </div>
  );
}
