import React from "react";
import "./BeachCard.css";

export default function BeachCard({ beach, isExpanded }) {
  const getCrowdColor = (level) => {
    switch (level) {
      case "low":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "high":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getCrowdEmoji = (level) => {
    switch (level) {
      case "low":
        return "😊";
      case "medium":
        return "😐";
      case "high":
        return "😰";
      default:
        return "❓";
    }
  };

  const getWeatherIcon = (weathercode) => {
    // WMO Weather codes
    const clearCodes = [0, 1];
    const cloudyCodes = [2, 3];
    const rainCodes = [45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82];
    
    if (clearCodes.includes(weathercode)) return "☀️";
    if (cloudyCodes.includes(weathercode)) return "☁️";
    if (rainCodes.includes(weathercode)) return "🌧️";
    return "🌤️";
  };

  return (
    <div className={`beach-card ${isExpanded ? "expanded" : ""}`}>
      <div className="card-header">
        <h3>{beach.beach}</h3>
        <span className="crowd-status">{getCrowdEmoji(beach.crowd_level)}</span>
      </div>

      <div className="crowd-indicator">
        <div className="crowd-bar-container">
          <div
            className="crowd-bar"
            style={{
              width: `${beach.crowd_score}%`,
              backgroundColor: getCrowdColor(beach.crowd_level),
            }}
          ></div>
        </div>
        <p className="crowd-score">{beach.crowd_score}% crowded</p>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="label">Crowd Level</span>
          <span className="value" style={{ color: getCrowdColor(beach.crowd_level) }}>
            {beach.crowd_level.toUpperCase()}
          </span>
        </div>
        <div className="info-item">
          <span className="label">Temperature</span>
          <span className="value">{beach.temperature}°C</span>
        </div>
        <div className="info-item">
          <span className="label">Rain Probability</span>
          <span className="value">{Math.round(beach.precipitation_probability)}%</span>
        </div>
        <div className="info-item">
          <span className="label">Time Status</span>
          <span className="value">
            {beach.is_peak_hour ? "🔴 Peak Hour" : "🟢 Off-Peak"}
            {beach.is_weekend ? " • 📅 Weekend" : " • 📅 Weekday"}
          </span>
        </div>
      </div>

      <div className="recommendation">
        <p className="rec-title">📍 Recommendation:</p>
        <p className="rec-text">{beach.recommendation}</p>
      </div>

      {isExpanded && (
        <div className="expanded-details">
          <div className="detail-section">
            <h4>Sentiment Analysis</h4>
            <p>Social media sentiment score: {beach.sentiment_score}</p>
          </div>
          <div className="detail-section">
            <h4>Detailed Weather</h4>
            <p>{getWeatherIcon(0)} Current conditions favorable for beach visit</p>
          </div>
        </div>
      )}
    </div>
  );
}
