import React from "react";
import "./LoadingSpinner.css";

export default function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading beach predictions...</p>
    </div>
  );
}
