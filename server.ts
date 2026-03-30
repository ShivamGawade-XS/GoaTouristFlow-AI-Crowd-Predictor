import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "goa-cds-secret-key-2026";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Mock Database
  const beaches = [
    { id: "calangute", name: "Calangute", lat: 15.5443, lng: 73.7553, cds: 18, status: "Low", district: "North Goa", type: "Tourist Hub" },
    { id: "baga", name: "Baga", lat: 15.5553, lng: 73.7517, cds: 78, status: "High", district: "North Goa", type: "Nightlife Hub" },
    { id: "anjuna", name: "Anjuna", lat: 15.5733, lng: 73.7410, cds: 12, status: "Very Low", district: "North Goa", type: "Flea Market" },
    { id: "palolem", name: "Palolem", lat: 15.0100, lng: 74.0232, cds: 29, status: "Low", district: "South Goa", type: "Scenic" },
    { id: "vagator", name: "Vagator", lat: 15.5993, lng: 73.7336, cds: 52, status: "Moderate", district: "North Goa", type: "Cliffside" },
  ];

  const users = [
    { id: "1", email: "admin@goacds.gov", password: await bcrypt.hash("admin123", 10), role: "admin" }
  ];

  const alerts = [];

  // API Routes
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/beaches", (req, res) => {
    res.json(beaches);
  });

  app.get("/api/beaches/:id", (req, res) => {
    const beach = beaches.find(b => b.id === req.params.id);
    if (beach) {
      // Generate mock forecast
      const forecast = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        cds: Math.floor(Math.random() * 100),
        historical: Math.floor(Math.random() * 100)
      }));
      res.json({ ...beach, forecast });
    } else {
      res.status(404).json({ error: "Beach not found" });
    }
  });

  app.post("/api/reports", (req, res) => {
    const { beachId, rating } = req.body;
    console.log(`Report received for ${beachId}: ${rating}`);
    res.json({ success: true });
  });

  app.get("/api/alerts", (req, res) => {
    res.json(alerts);
  });

  app.post("/api/alerts", (req, res) => {
    const alert = { id: Date.now().toString(), ...req.body };
    alerts.push(alert);
    res.json(alert);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // WebSocket Server for real-time CDS
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    
    const interval = setInterval(() => {
      const updates = beaches.map(b => ({
        id: b.id,
        cds: Math.max(0, Math.min(100, b.cds + (Math.random() * 10 - 5)))
      }));
      ws.send(JSON.stringify({ type: "CDS_UPDATE", data: updates }));
    }, 5000);

    ws.on("close", () => clearInterval(interval));
  });
}

startServer();
