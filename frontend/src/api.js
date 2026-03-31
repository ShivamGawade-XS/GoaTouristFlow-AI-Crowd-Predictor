const API_URL = "http://localhost:8000";

export async function fetchPrediction(beach) {
  const res = await fetch(`${API_URL}/predict/${beach}`);
  if (!res.ok) throw new Error(`Failed to fetch prediction for ${beach}`);
  return res.json();
}

export async function fetchAllPredictions() {
  const res = await fetch(`${API_URL}/beaches`);
  if (!res.ok) throw new Error("Failed to fetch all predictions");
  return res.json();
}

export async function subscribeAlert(beach, threshold, email) {
  const res = await fetch(`${API}/alert/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ beach, threshold, email }),
  });
  if (!res.ok) throw new Error("Failed to subscribe");
  return res.json();
}
