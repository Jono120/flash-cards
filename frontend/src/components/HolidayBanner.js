// frontend/src/components/HolidayBanner.js
// import React from "react";

// export default function HolidayBanner({ holiday, onManageClick }) {
//   if (!holiday) return null;

//   return (
//     <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 flex justify-between items-center">
//       <p className="text-yellow-800 font-semibold">
//         🏖 Holiday Mode Active: {holiday.start_date} → {holiday.end_date}.
//         Your streak is frozen.
//       </p>
//       <button
//         onClick={onManageClick}
//         className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
//       >
//         Manage
//       </button>
//     </div>
//   );
// }

// frontend/src/components/HolidayBanner.js
import React from "react";

export default function HolidayBanner({ holiday, onManageClick }) {
  if (!holiday) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 flex justify-between items-center">
      <p className="text-yellow-800 font-semibold">
        🏖 Holiday Mode Active: {holiday.start_date} → {holiday.end_date} <br />
        ⏳ {holiday.days_left} day{holiday.days_left !== 1 ? "s" : ""} left.
        {holiday.skip_catchup ? " (Catch-up will be skipped)" : ""}
      </p>
      <button
        onClick={onManageClick}
        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Manage
      </button>
    </div>
  );
}
