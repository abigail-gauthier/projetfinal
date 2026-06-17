// ─── Imports ────────────────────────────────────────────
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware');

// ─── Setup ──────────────────────────────────────────────
const app = express();
const prisma = new PrismaClient({ log: ['error'] });
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

// ─── Register a new user ────────────────────────────────
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if the email is already taken
    const existingUser = await prisma.users.findUnique({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get the "Client" role id from the Roles table
    const clientRole = await prisma.roles.findUnique({ where: { RoleName: 'Client' } });

    // Create the user
    const newUser = await prisma.users.create({
      data: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        PasswordHash: passwordHash,
        Phone: phone || null,
        RoleId: clientRole.RoleId
      }
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: { id: newUser.UserId, email: newUser.Email, firstName: newUser.FirstName }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Log in an existing user ────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.users.findUnique({ where: { Email: email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Compare the password with the encrypted one stored in the database
    const passwordMatches = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Create a JWT token (a secure "ID card" the user will use for future requests)
    const token = jwt.sign(
      { userId: user.UserId, roleId: user.RoleId },
      'temporary-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: user.UserId, email: user.Email, firstName: user.FirstName }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ─── Protected route example (requires valid JWT) ───────
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    // The middleware attached the user info to req.user
    const user = await prisma.users.findUnique({
      where: { UserId: req.user.userId },
      select: { UserId: true, FirstName: true, LastName: true, Email: true, RoleId: true }
    });
    res.json({ message: 'Profil récupéré avec succès', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ─── Start the server ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});