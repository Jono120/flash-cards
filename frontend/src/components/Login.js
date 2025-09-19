//// frontend/src/components/Login.js
import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [userId, setUserId] = useState("1");

  const devLogin = () => {
    const id = parseInt(userId || "1", 10);
    onLogin?.({ id, name: "Dev User" });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-6">Welcome to Flashcards</h2>
        <p className="text-gray-600 mb-4">Enter a user ID to continue.</p>
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium mb-1">User ID</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="1"
          />
        </div>
        <button
          onClick={devLogin}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Continue
        </button>
        <p className="text-xs text-gray-500 mt-3">
          OAuth is disabled in local debug mode.
        </p>
      </div>
    </div>
  );
}
