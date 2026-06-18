// ─── Imports ────────────────────────────────────────────
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./src/config/prisma');
const authRoutes = require('./src/routes/authRoutes');

// ─── Setup ──────────────────────────────────────────────
const app = express();
const PORT = 3000;

// ─── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'LexY Executive Service API is running!' });
});

// Quick test route to confirm the database is connected
app.get('/api/test', async (req, res) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json({ message: 'Database connection works!', roles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Authentication routes (register, login, me)
app.use('/api', authRoutes);

// ─── Start the server ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});