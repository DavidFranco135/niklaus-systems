import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const db = new Database('niklaus.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    contact TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    name TEXT,
    status TEXT, -- 'ongoing', 'finished'
    total_value REAL,
    paid_value REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    type TEXT, -- 'image', 'video'
    url TEXT, -- Main/Cover URL
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gallery_id INTEGER,
    url TEXT,
    FOREIGN KEY (gallery_id) REFERENCES gallery(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('cover_photo', 'https://picsum.photos/seed/niklaus-dark/1920/1080');
`);

// Seed default user if not exists
const userExists = db.prepare('SELECT * FROM users WHERE username = ?').get('niklausadm@gmail.com');
if (!userExists) {
  // Clear old default if exists (optional but cleaner)
  db.prepare('DELETE FROM users WHERE username = ?').run('admin');
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('niklausadm@gmail.com', '135135');
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use('/uploads', express.static(uploadsDir));

  // API Routes
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: filePath });
  });
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  // Clients API
  app.get('/api/clients', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    res.json(clients);
  });

  app.post('/api/clients', (req, res) => {
    const { name, contact, notes } = req.body;
    const result = db.prepare('INSERT INTO clients (name, contact, notes) VALUES (?, ?, ?)').run(name, contact, notes);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/clients/:id', (req, res) => {
    const { name, contact, notes } = req.body;
    db.prepare('UPDATE clients SET name = ?, contact = ?, notes = ? WHERE id = ?').run(name, contact, notes, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/clients/:id', (req, res) => {
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Services API
  app.get('/api/services', (req, res) => {
    const services = db.prepare(`
      SELECT services.*, clients.name as client_name 
      FROM services 
      JOIN clients ON services.client_id = clients.id 
      ORDER BY services.created_at DESC
    `).all();
    res.json(services);
  });

  app.post('/api/services', (req, res) => {
    const { client_id, name, status, total_value, paid_value } = req.body;
    const result = db.prepare('INSERT INTO services (client_id, name, status, total_value, paid_value) VALUES (?, ?, ?, ?, ?)').run(client_id, name, status, total_value, paid_value);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/services/:id', (req, res) => {
    const { client_id, name, status, total_value, paid_value } = req.body;
    db.prepare('UPDATE services SET client_id = ?, name = ?, status = ?, total_value = ?, paid_value = ? WHERE id = ?').run(client_id, name, status, total_value, paid_value, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/services/:id', (req, res) => {
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Gallery API
  app.get('/api/gallery', (req, res) => {
    const items = db.prepare('SELECT * FROM gallery ORDER BY created_at DESC').all();
    const itemsWithImages = items.map((item: any) => {
      const images = db.prepare('SELECT * FROM gallery_images WHERE gallery_id = ?').all(item.id);
      return { ...item, images };
    });
    res.json(itemsWithImages);
  });

  app.post('/api/gallery', (req, res) => {
    const { title, description, type, url, images } = req.body;
    const insertItem = db.prepare('INSERT INTO gallery (title, description, type, url) VALUES (?, ?, ?, ?)');
    const result = insertItem.run(title, description, type, url);
    const galleryId = result.lastInsertRowid;

    if (images && Array.isArray(images)) {
      const insertImage = db.prepare('INSERT INTO gallery_images (gallery_id, url) VALUES (?, ?)');
      for (const imageUrl of images) {
        insertImage.run(galleryId, imageUrl);
      }
    }
    res.json({ id: galleryId });
  });

  app.put('/api/gallery/:id', (req, res) => {
    const { title, description, type, url, images } = req.body;
    const { id } = req.params;

    db.prepare('UPDATE gallery SET title = ?, description = ?, type = ?, url = ? WHERE id = ?')
      .run(title, description, type, url, id);

    // Refresh images: delete old and insert new
    db.prepare('DELETE FROM gallery_images WHERE gallery_id = ?').run(id);
    if (images && Array.isArray(images)) {
      const insertImage = db.prepare('INSERT INTO gallery_images (gallery_id, url) VALUES (?, ?)');
      for (const imageUrl of images) {
        // Handle both string URLs and objects with url property
        const urlToInsert = typeof imageUrl === 'string' ? imageUrl : imageUrl.url;
        insertImage.run(id, urlToInsert);
      }
    }
    res.json({ success: true });
  });

  app.delete('/api/gallery/:id', (req, res) => {
    db.prepare('DELETE FROM gallery_images WHERE gallery_id = ?').run(req.params.id);
    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Settings API
  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  });

  app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    res.json({ success: true });
  });

  // Stats API
  app.get('/api/stats', (req, res) => {
    const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get().count;
    const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
    const finances = db.prepare('SELECT SUM(total_value) as total, SUM(paid_value) as paid FROM services').get();
    res.json({
      clients: clientCount,
      services: serviceCount,
      finances: {
        total: finances.total || 0,
        paid: finances.paid || 0,
        remaining: (finances.total || 0) - (finances.paid || 0)
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
