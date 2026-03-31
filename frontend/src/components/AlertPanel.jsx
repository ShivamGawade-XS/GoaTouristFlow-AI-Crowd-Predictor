import React from "react";
import "./AlertPanel.css";

export default function AlertPanel({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="alert-panel">
      <h2>🚨 Active Alerts</h2>
      <div className="alerts-list">
        {alerts.map((alert, idx) => (
          <div key={idx} className={`alert alert-${alert.urgency}`}>
            <div className="alert-header">
              <span className="alert-beach">{alert.beach}</span>
              <span className={`urgency-badge urgency-${alert.urgency}`}>
                {alert.urgency.toUpperCase()}
              </span>
            </div>
            <p className="alert-message">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
