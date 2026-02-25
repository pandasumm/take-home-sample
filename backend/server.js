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

const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
