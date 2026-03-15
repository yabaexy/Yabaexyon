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
    minPrice TEXT,
    pricingType TEXT DEFAULT 'Fixed',
    imageUrl TEXT,
    sellerAddress TEXT NOT NULL,
    category TEXT,
    condition TEXT,
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

db.exec(`
  CREATE TABLE IF NOT EXISTS nonces (
    address TEXT PRIMARY KEY,
    nonce TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itemId INTEGER NOT NULL,
    buyerAddress TEXT NOT NULL,
    sellerAddress TEXT NOT NULL,
    price TEXT NOT NULL,
    status TEXT DEFAULT 'Completed',
    rating INTEGER,
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itemId) REFERENCES items(id)
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.get("/api/auth/nonce/:address", (req, res) => {
    const { address } = req.params;
    const nonce = `Sign this message to authenticate with Yabamate Market: ${Math.floor(Math.random() * 1000000)}`;
    
    db.prepare(`
      INSERT INTO nonces (address, nonce)
      VALUES (?, ?)
      ON CONFLICT(address) DO UPDATE SET nonce = excluded.nonce, updatedAt = CURRENT_TIMESTAMP
    `).run(address, nonce);
    
    res.json({ nonce });
  });

  app.post("/api/auth/verify", async (req, res) => {
    const { address, signature } = req.body;
    
    const row = db.prepare("SELECT nonce FROM nonces WHERE address = ?").get(address) as { nonce: string } | undefined;
    if (!row) return res.status(400).json({ error: "Nonce not found" });
    
    try {
      const { verifyMessage } = await import("ethers");
      const recoveredAddress = verifyMessage(row.nonce, signature);
      
      if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        // In a real app, set a session/JWT here
        // For this demo, we'll just confirm success
        db.prepare("DELETE FROM nonces WHERE address = ?").run(address);
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid signature" });
      }
    } catch (err) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // API Routes
  app.get("/api/items", (req, res) => {
    const items = db.prepare("SELECT * FROM items ORDER BY createdAt DESC").all();
    res.json(items);
  });

  app.post("/api/items", (req, res) => {
    const { onChainId, title, description, price, minPrice, pricingType, imageUrl, sellerAddress, category, condition } = req.body;
    const info = db.prepare(`
      INSERT INTO items (onChainId, title, description, price, minPrice, pricingType, imageUrl, sellerAddress, category, condition)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(onChainId, title, description, price, minPrice, pricingType, imageUrl, sellerAddress, category, condition);
    
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/items/:id", (req, res) => {
    const item = db.prepare("SELECT * FROM items WHERE onChainId = ?").get(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  });

  app.put("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, price, minPrice, pricingType, imageUrl, sellerAddress, category, condition } = req.body;
    
    // Security check: Ensure the item belongs to the sellerAddress
    const item = db.prepare("SELECT sellerAddress FROM items WHERE id = ?").get(id) as { sellerAddress: string } | undefined;
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.sellerAddress.toLowerCase() !== sellerAddress.toLowerCase()) {
      return res.status(403).json({ error: "Unauthorized: You do not own this item" });
    }

    db.prepare(`
      UPDATE items 
      SET title = ?, description = ?, price = ?, minPrice = ?, pricingType = ?, imageUrl = ?, category = ?, condition = ?
      WHERE id = ?
    `).run(title, description, price, minPrice, pricingType, imageUrl, category, condition, id);
    
    res.json({ success: true });
  });

  app.delete("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const { sellerAddress } = req.body;

    const item = db.prepare("SELECT sellerAddress FROM items WHERE id = ?").get(id) as { sellerAddress: string } | undefined;
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.sellerAddress.toLowerCase() !== sellerAddress.toLowerCase()) {
      return res.status(403).json({ error: "Unauthorized: You do not own this item" });
    }

    db.prepare("DELETE FROM items WHERE id = ?").run(id);
    res.json({ success: true });
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

  app.get("/api/users/:address/transactions", (req, res) => {
    const { address } = req.params;
    const transactions = db.prepare(`
      SELECT t.*, i.title as itemTitle, i.imageUrl as itemImageUrl
      FROM transactions t
      JOIN items i ON t.itemId = i.id
      WHERE t.sellerAddress = ? OR t.buyerAddress = ?
      ORDER BY t.createdAt DESC
    `).all(address, address);
    res.json(transactions);
  });

  app.post("/api/transactions", (req, res) => {
    const { itemId, buyerAddress, sellerAddress, price } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO transactions (itemId, buyerAddress, sellerAddress, price)
        VALUES (?, ?, ?, ?)
      `).run(itemId, buyerAddress, sellerAddress, price);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/transactions/:id/rate", (req, res) => {
    const { id } = req.params;
    const { rating, comment, buyerAddress } = req.body;
    
    const tx = db.prepare("SELECT buyerAddress FROM transactions WHERE id = ?").get(id) as { buyerAddress: string } | undefined;
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.buyerAddress.toLowerCase() !== buyerAddress.toLowerCase()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    db.prepare("UPDATE transactions SET rating = ?, comment = ? WHERE id = ?").run(rating, comment, id);
    res.json({ success: true });
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
