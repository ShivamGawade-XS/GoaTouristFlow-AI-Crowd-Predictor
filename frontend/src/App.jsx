import { useState, useEffect, useCallback } from "react";
import { fetchPrediction, fetchAllPredictions } from "./api";
import BeachCard from "./BeachCard";
import AlertModal from "./AlertModal";

const BEACHES = ["Calangute", "Baga", "Anjuna", "Palolem", "Vagator", "Colva"];

export default function App() {
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingBeach, setLoadingBeach] = useState(null);
  const [error, setError] = useState(null);
  const [alertBeach, setAlertBeach] = useState(null);
  const [filter, setFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllPredictions();
      const map = {};
      data.beaches.forEach(b => { map[b.beach] = b; });
      setPredictions(map);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBeach = async (beach) => {
    setLoadingBeach(beach);
    try {
      const data = await fetchPrediction(beach);
      setPredictions(prev => ({ ...prev, [beach]: data }));
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingBeach(null);
    }
  };

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = BEACHES
    .filter(b => predictions[b])
    .filter(b => {
      if (filter === "low") return predictions[b].crowd_score < 0.4;
      if (filter === "high") return predictions[b].crowd_score >= 0.6;
      return true;
    })
    .sort((a, b) => predictions[a].crowd_score - predictions[b].crowd_score);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        borderBottom: "1px solid #1e293b",
        padding: "20px 24px",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0ea5e9" }}>
                🌊 GoaTouristFlow
              </h1>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                AI-powered beach crowd predictor · Goa, India
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {lastUpdated && (
                <span style={{ fontSize: 12, color: "#475569" }}>
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button onClick={loadAll} disabled={loading} style={refreshBtnStyle}>
                {loading ? "⏳ Loading..." : "🔄 Refresh All"}
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[["all", "All Beaches"], ["low", "🟢 Low Crowd"], ["high", "🔴 High Crowd"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: "6px 14px", borderRadius: 20, border: "none",
                background: filter === val ? "#0ea5e9" : "#1e293b",
                color: filter === val ? "#fff" : "#64748b",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {error && (
          <div style={{
            background: "#450a0a", border: "1px solid #dc2626",
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            color: "#f87171", fontSize: 14,
          }}>
            ⚠️ {error} — Make sure the backend is running on port 8000.
          </div>
        )}

        {loading && Object.keys(predictions).length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {BEACHES.map(b => (
              <div key={b} style={{
                background: "#1e293b", borderRadius: 16, height: 280,
                animation: "pulse 1.5s infinite", border: "1px solid #334155",
              }} />
            ))}
          </div>
        ) : (
          <>
            {filtered.length === 0 && !loading && (
              <p style={{ textAlign: "center", color: "#475569", marginTop: 60 }}>
                No beaches match this filter.
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {filtered.map(beach => (
                <div key={beach} style={{ position: "relative" }}>
                  {loadingBeach === beach && (
                    <div style={{
                      position: "absolute", inset: 0, background: "#0f172a99",
                      borderRadius: 16, display: "flex", alignItems: "center",
                      justifyContent: "center", zIndex: 10, fontSize: 24,
                    }}>⏳</div>
                  )}
                  <BeachCard
                    data={predictions[beach]}
                    onAlert={setAlertBeach}
                  />
                  <button
                    onClick={() => refreshBeach(beach)}
                    style={{
                      position: "absolute", top: 12, right: 12,
                      background: "#0f172a", border: "1px solid #334155",
                      borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                      color: "#64748b", fontSize: 11,
                    }}
                  >↻ refresh</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Legend */}
        <div style={{
          marginTop: 40, padding: "16px 20px",
          background: "#1e293b", borderRadius: 12,
          border: "1px solid #334155",
        }}>
          <p style={{ fontSize: 12, color: "#475569", marginBottom: 10, fontWeight: 600 }}>CROWD LEVEL LEGEND</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              ["🟢", "Low", "< 25%", "#4ade80"],
              ["🟡", "Moderate", "25–50%", "#facc15"],
              ["🟠", "High", "50–75%", "#fb923c"],
              ["🔴", "Very High", "> 75%", "#f87171"],
            ].map(([icon, label, range, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <span>{icon}</span>
                <span style={{ color }}>{label}</span>
                <span style={{ color: "#475569" }}>{range}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 24 }}>
          Data sources: Open-Meteo Weather API · Simulated social sentiment · AI crowd analysis
        </p>
      </main>

      {alertBeach && (
        <AlertModal beach={alertBeach} onClose={() => setAlertBeach(null)} />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

const refreshBtnStyle = {
  background: "#0ea5e9", border: "none", color: "#fff",
  padding: "8px 18px", borderRadius: 8, cursor: "pointer",
  fontSize: 14, fontWeight: 600,
};
