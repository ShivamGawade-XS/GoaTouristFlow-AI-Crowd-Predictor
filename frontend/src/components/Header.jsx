import React from "react";
import "./Header.css";

export default function Header({ onRefresh, lastUpdated }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>🌊 GoaTouristFlow</h1>
          <p className="subtitle">Real-time Beach Crowd Predictions</p>
        </div>
        <div className="header-right">
          <div className="last-updated">
            {lastUpdated && <p>Last updated: {lastUpdated}</p>}
          </div>
          <button className="refresh-btn" onClick={onRefresh} title="Refresh predictions">
            🔄 Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
