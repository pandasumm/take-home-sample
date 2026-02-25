import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const db = await connectDB();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend is working fine" });
});

app.get("/api/tickets", async (req, res) => {
  const tickets = await db.all("SELECT * FROM tickets ORDER BY show_name, date, section");
  res.json(tickets);
});

// rate limit to 1 request per second
let lastRequestTime = 0;

app.post("/api/tickets/:id/buy", async (req, res) => {
  const now = Date.now();
  if (now - lastRequestTime < 1000) {
    return res.status(429).json({ error: "Too many requests" });
  }
  lastRequestTime = now;

  const { id } = req.params;
  const ticket = await db.get("SELECT * FROM tickets WHERE id = ?", id);
  if (!ticket) return res.status(404).json({ error: "Not found" });

  const newCount = ticket.count - 1;

  await db.run("UPDATE tickets SET count = ? WHERE id = ?", newCount, id);

  const allTickets = await db.all("SELECT * FROM tickets");

  const updated = await db.get("SELECT * FROM tickets WHERE id = ?", id);
  res.json({allTickets,updated});
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
