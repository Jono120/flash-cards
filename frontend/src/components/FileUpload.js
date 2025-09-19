// frontend/src/components/FileUpload.js
import React, { useState } from "react";
import { uploadFile } from "../api";

export default function FileUpload({ user, onFlashcardsGenerated }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const result = await uploadFile(file, user.id);
    onFlashcardsGenerated(result.flashcards || []);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-4 p-4 bg-white rounded-xl shadow-md">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        {loading ? "Processing..." : "Upload & Generate Flashcards"}
      </button>
    </div>
  );
}
