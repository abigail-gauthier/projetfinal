const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// ─── Register a new user ────────────────────────────────
async function register(req, res) {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const clientRole = await prisma.roles.findUnique({ where: { RoleName: 'Client' } });

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
}

// ─── Log in an existing user ────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { Email: email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

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
}

// ─── Get the logged-in user's profile ───────────────────
async function getMe(req, res) {
  try {
    const user = await prisma.users.findUnique({
      where: { UserId: req.user.userId },
      select: { UserId: true, FirstName: true, LastName: true, Email: true, RoleId: true }
    });
    res.json({ message: 'Profil récupéré avec succès', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { register, login, getMe };