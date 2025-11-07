import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const DB_FILE = process.env.DATABASE_FILE || './data.db';

// Initialize DB
const db = new Database(DB_FILE);
db.pragma('journal_mode = wal');

// Create tables if not exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    userId INTEGER NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(postId) REFERENCES posts(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`).run();

// Helpers
function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token ausente' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// ------------------- AUTH -------------------

// Register
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username e password são obrigatórios' });
  if (String(username).length < 3) return res.status(400).json({ error: 'username deve ter pelo menos 3 caracteres' });
  if (String(password).length < 6) return res.status(400).json({ error: 'password deve ter pelo menos 6 caracteres' });

  const hashed = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashed);
    const user = { id: info.lastInsertRowid, username };
    const token = createToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    if (String(err).includes('UNIQUE')) {
      return res.status(409).json({ error: 'username já existe' });
    }
    return res.status(500).json({ error: 'Erro ao registrar' });
  }
});

// Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username e password são obrigatórios' });

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) return res.status(401).json({ error: 'Credenciais inválidas' });
  const ok = bcrypt.compareSync(password, row.password);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

  const user = { id: row.id, username: row.username };
  const token = createToken(user);
  res.json({ user, token });
});

// ------------------- POSTS -------------------

// GET /posts?page=1&limit=5
app.get('/posts', (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '5', 10);
  const offset = (page - 1) * limit;

  const total = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
  const rows = db.prepare(`
    SELECT p.*, u.username AS author
    FROM posts p
    JOIN users u ON u.id = p.userId
    ORDER BY p.createdAt DESC, p.id DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  res.json({ data: rows, page, limit, total, totalPages: Math.ceil(total / limit) });
});

// GET /posts/:id
app.get('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = db.prepare(`
    SELECT p.*, u.username AS author
    FROM posts p
    JOIN users u ON u.id = p.userId
    WHERE p.id = ?
  `).get(id);
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });
  res.json(post);
});

// POST /posts
app.post('/posts', auth, (req, res) => {
  const { title, body } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Título é obrigatório' });
  if (!body || !body.trim()) return res.status(400).json({ error: 'Texto é obrigatório' });

  const info = db.prepare('INSERT INTO posts (title, body, userId) VALUES (?, ?, ?)')
    .run(title.trim(), body.trim(), req.user.id);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(post);
});

// ------------------- COMMENTS -------------------

// GET /comments/:postId
app.get('/comments/:postId', (req, res) => {
  const postId = Number(req.params.postId);
  const rows = db.prepare(`
    SELECT c.*, u.username AS author
    FROM comments c
    JOIN users u ON u.id = c.userId
    WHERE c.postId = ?
    ORDER BY c.createdAt ASC, c.id ASC
  `).all(postId);
  res.json(rows);
});

// POST /comments
app.post('/comments', auth, (req, res) => {
  const { text, postId } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Comentário não pode ser vazio' });
  if (!postId) return res.status(400).json({ error: 'postId é obrigatório' });

  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });

  const info = db.prepare('INSERT INTO comments (text, postId, userId) VALUES (?, ?, ?)')
    .run(text.trim(), postId, req.user.id);
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(comment);
});

// Health
app.get('/', (req, res) => res.send('API OK'));

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
