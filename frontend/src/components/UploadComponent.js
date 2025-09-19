// frontend/src/components/UploadComponent.js
import React, { useState } from "react";
import { uploadFile } from "../api";

export default function UploadComponent({ user }) {
  const [file, setFile] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const result = await uploadFile(user.id, file);
    setChunks(result.chunks);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white rounded-2xl shadow-md text-center">
      <h2 className="text-xl font-bold mb-4">📤 Upload Study Notes</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={!file}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Upload & Chunk
      </button>

      {loading && <p className="mt-4">⏳ Processing...</p>}

      {chunks.length > 0 && (
        <div className="mt-4 text-left">
          <h3 className="font-bold mb-2">Chunks ({chunks.length}):</h3>
          <ul className="list-disc list-inside max-h-40 overflow-y-scroll text-sm">
            {chunks.map((c, i) => (
              <li key={i}>{c.slice(0, 100)}...</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
