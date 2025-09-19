// frontend/src/App.js
import React, { useState, useEffect } from "react";
import "./styles/index.css";
import { getDashboard, getDailyReview } from "./api";
import Login from "./components/Login";
import FileUpload from "./components/FileUpload";
import FlashcardViewer from "./components/FlashCardViewer";
import WelcomeBanner from "./components/WelcomeBanner";

function Home({ user }) {
  const [tab, setTab] = useState("upload");
  const [dashboard, setDashboard] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [daily, setDaily] = useState({ today: [], catchup: [], missed_days: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dash, dailyResp] = await Promise.all([
          getDashboard(user.id).catch(() => null),
          getDailyReview(user.id).catch(() => ({ today: [], catchup: [], missed_days: false })),
        ]);
        if (!mounted) return;
        setDashboard(dash);
        setDaily(dailyResp);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [user]);

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <div className="brand-badge">F</div>
          <div>Flashcards</div>
        </div>
        <div className="user-pill">User #{user.id}</div>
      </header>

      <WelcomeBanner user={user} />

      {/* Quick hero section */}
      <section className="panel" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>Welcome{dashboard?.streak ? `, keep it up!` : ""}</h2>
            <p className="muted" style={{ marginTop: 4 }}>
              {loading ? "Loading your progress..." : `You have ${daily?.today?.length ?? 0} cards to review today.`}
            </p>
            {daily?.missed_days ? (
              <p className="muted" style={{ marginTop: 4 }}>You have cards from missed days. Check catch-up in Progress.</p>
            ) : null}
            {error ? <p className="error" role="alert">{error}</p> : null}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`tab ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>
              Start review
            </button>
            <button className={`tab ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>
              Upload documents
            </button>
          </div>
        </div>
      </section>

      <nav className="nav" role="tablist" style={{ marginTop: 8 }}>
        <button className={`tab ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>
          Upload
        </button>
        <button className={`tab ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>
          Review
        </button>
        <button className={`tab ${tab === "progress" ? "active" : ""}`} onClick={() => setTab("progress")}>
          Progress
        </button>
      </nav>

      {tab === "upload" && (
        <section className="grid" style={{ marginTop: 16 }}>
          <div className="panel">
            <h3>Upload documents</h3>
            <p className="muted">PDF, DOCX, PPTX are supported.</p>
            <FileUpload user={user} onFlashcardsGenerated={setFlashcards} />
          </div>
          <div className="panel">
            <h3>Latest generated</h3>
            {flashcards?.length ? (
              <ul>
                {flashcards.slice(0, 5).map((c) => (
                  <li key={c.id}>{c.question}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">No flashcards generated yet.</p>
            )}
          </div>
        </section>
      )}

      {tab === "review" && (
        <section className="panel" style={{ marginTop: 16 }}>
          <h3>Daily review</h3>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : !daily?.today?.length && !flashcards?.length ? (
            <p className="muted">No cards ready. Upload content to generate cards.</p>
          ) : (
            <FlashcardViewer user={user} flashcards={flashcards.length ? flashcards : daily.today} />
          )}
        </section>
      )}

      {tab === "progress" && (
        <section className="grid" style={{ marginTop: 16 }}>
          <div className="panel">
            <h3>Overview</h3>
            <ul>
              <li>Mastered: {dashboard?.mastered ?? 0}</li>
              <li>
                Streak: {dashboard?.streak ?? 0} ({dashboard?.streak_status || (dashboard?.streak ? "active" : "-")})
              </li>
            </ul>
          </div>
          <div className="panel">
            <h3>Catch-up</h3>
            {daily?.catchup?.length ? (
              <p>{daily.catchup.length} cards from missed days</p>
            ) : (
              <p className="muted">No catch-up needed.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <Login onLogin={setUser} />;
  return <Home user={user} />;
}
