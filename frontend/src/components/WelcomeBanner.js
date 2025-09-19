// frontend/src/components/WelcomeBanner.js
import React from "react";

export default function WelcomeBanner({ user }) {
  const name = user?.name || `User #${user?.id ?? ""}`;
  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <h2 style={{ margin: 0 }}>Welcome, {name} ??</h2>
      <p className="muted" style={{ marginTop: 4 }}>
        Upload your study materials and start reviewing your AI-generated flashcards.
      </p>
    </section>
  );
}
