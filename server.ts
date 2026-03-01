import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("wyda.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    onChainId INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    imageUrl TEXT,
    sellerAddress TEXT NOT NULL,
    category TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    bio TEXT,
    avatarUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/items", (req, res) => {
    const items = db.prepare("SELECT * FROM items ORDER BY createdAt DESC").all();
    res.json(items);
  });

  app.post("/api/items", (req, res) => {
    const { onChainId, title, description, price, imageUrl, sellerAddress, category } = req.body;
    const info = db.prepare(`
      INSERT INTO items (onChainId, title, description, price, imageUrl, sellerAddress, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(onChainId, title, description, price, imageUrl, sellerAddress, category);
    
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/items/:id", (req, res) => {
    const item = db.prepare("SELECT * FROM items WHERE onChainId = ?").get(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  });

  // User Routes
  app.get("/api/users/:address", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE address = ?").get(req.params.address);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.post("/api/users", (req, res) => {
    const { address, username, bio, avatarUrl } = req.body;
    try {
      db.prepare(`
        INSERT INTO users (address, username, bio, avatarUrl)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(address) DO UPDATE SET
          username = excluded.username,
          bio = excluded.bio,
          avatarUrl = excluded.avatarUrl
      `).run(address, username, bio, avatarUrl);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/users/:address/items", (req, res) => {
    const items = db.prepare("SELECT * FROM items WHERE sellerAddress = ? ORDER BY createdAt DESC").all(req.params.address);
    res.json(items);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
