const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');

// ---------- Yordamchi funksiyalar (JSON fayl bilan ishlash) ----------
function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'blog-platform-maxfiy-kalit-o1u2z3',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 kun
  }
}));

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Tizimga kirish talab qilinadi.' });
  }
  next();
}

// ================= AUTH API =================

// Ro'yxatdan o'tish
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Parol kamida 6 belgidan iborat bo'lishi kerak." });
  }

  const users = readJSON(USERS_FILE);
  const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Bu foydalanuvchi nomi yoki email allaqachon band.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: nanoid(10),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);

  req.session.user = { id: newUser.id, username: newUser.username, email: newUser.email };
  res.json({ success: true, user: req.session.user });
});

// Tizimga kirish
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Login va parolni kiriting.' });
  }

  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Foydalanuvchi topilmadi.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: "Parol noto'g'ri." });
  }

  req.session.user = { id: user.id, username: user.username, email: user.email };
  res.json({ success: true, user: req.session.user });
});

// Chiqish
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Joriy sessiyani tekshirish
app.get('/api/session', (req, res) => {
  res.json({ user: req.session.user || null });
});

// ================= POSTS API =================

// Barcha postlarni olish
app.get('/api/posts', (req, res) => {
  const posts = readJSON(POSTS_FILE).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

// Bitta postni olish
app.get('/api/posts/:id', (req, res) => {
  const posts = readJSON(POSTS_FILE);
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post topilmadi.' });
  res.json(post);
});

// Foydalanuvchining o'z postlarini olish
app.get('/api/my-posts', requireAuth, (req, res) => {
  const posts = readJSON(POSTS_FILE)
    .filter(p => p.authorId === req.session.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

// Yangi post yaratish
app.post('/api/posts', requireAuth, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Sarlavha va matnni kiriting.' });
  }

  const posts = readJSON(POSTS_FILE);
  const newPost = {
    id: nanoid(10),
    title,
    content,
    author: req.session.user.username,
    authorId: req.session.user.id,
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  writeJSON(POSTS_FILE, posts);
  res.json({ success: true, post: newPost });
});

// Postni tahrirlash
app.put('/api/posts/:id', requireAuth, (req, res) => {
  const { title, content } = req.body;
  const posts = readJSON(POSTS_FILE);
  const idx = posts.findIndex(p => p.id === req.params.id);

  if (idx === -1) return res.status(404).json({ error: 'Post topilmadi.' });
  if (posts[idx].authorId !== req.session.user.id) {
    return res.status(403).json({ error: "Sizga bu postni tahrirlashga ruxsat yo'q." });
  }

  posts[idx].title = title || posts[idx].title;
  posts[idx].content = content || posts[idx].content;
  posts[idx].updatedAt = new Date().toISOString();
  writeJSON(POSTS_FILE, posts);
  res.json({ success: true, post: posts[idx] });
});

// Postni o'chirish
app.delete('/api/posts/:id', requireAuth, (req, res) => {
  const posts = readJSON(POSTS_FILE);
  const idx = posts.findIndex(p => p.id === req.params.id);

  if (idx === -1) return res.status(404).json({ error: 'Post topilmadi.' });
  if (posts[idx].authorId !== req.session.user.id) {
    return res.status(403).json({ error: "Sizga bu postni o'chirishga ruxsat yo'q." });
  }

  posts.splice(idx, 1);
  writeJSON(POSTS_FILE, posts);
  res.json({ success: true });
});

// ================= SERVERNI ISHGA TUSHIRISH =================
app.listen(PORT, () => {
  console.log(`✅ Server ishlamoqda: http://localhost:${PORT}`);
});
