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
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE,
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

  // Google OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `${process.env.APP_URL}/auth/google/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    res.json({ url: `${rootUrl}?${qs.toString()}` });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const code = req.query.code as string;
    
    try {
      const tokenUrl = "https://oauth2.googleapis.com/token";
      const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.APP_URL}/auth/google/callback`,
        grant_type: "authorization_code",
      };

      const { data } = await (await import('axios')).default.post(tokenUrl, new URLSearchParams(values).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = data;
      const { data: googleUser } = await (await import('axios')).default.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${access_token}`
      );

      // Here we would typically create a session or JWT
      // For this demo, we'll just pass the user info back to the client
      // In a real app, you'd find or create the user in the DB
      
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                type: 'GOOGLE_AUTH_SUCCESS', 
                user: ${JSON.stringify(googleUser)} 
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Google OAuth Error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed");
    }
  });

  // API Routes
  app.get("/api/items", (req, res) => {
    const items = db.prepare("SELECT * FROM items ORDER BY createdAt DESC").all();
    res.json(items);
  });

  app.post("/api/items", (req, res) => {
    const { onChainId, title, description, price, minPrice, pricingType, imageUrl, sellerAddress, category } = req.body;
    const info = db.prepare(`
      INSERT INTO items (onChainId, title, description, price, minPrice, pricingType, imageUrl, sellerAddress, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(onChainId, title, description, price, minPrice, pricingType, imageUrl, sellerAddress, category);
    
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
