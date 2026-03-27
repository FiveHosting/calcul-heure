const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { authenticateToken, getJwtSecret } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { isValidEmail, isValidPassword, isValidUsername } = require('../validation');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Trop de tentatives, réessayez dans 15 minutes.' });

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

function buildUserPayload(user) {
  return { id: user.id, username: user.username, email: user.email, role: user.role };
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }
    if (!isValidUsername(username)) {
      return res.status(400).json({ error: 'Nom d\'utilisateur invalide. Utilisez 3 à 30 caractères: lettres, chiffres, _ ou -.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir entre 10 et 128 caractères.' });
    }

    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });
      if (row) return res.status(400).json({ error: 'Un utilisateur avec ce nom ou cet email existe déjà.' });

      const hashedPassword = await bcrypt.hash(password, 12);
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(insertErr) {
          if (insertErr) return res.status(500).json({ error: 'Erreur lors de la création du compte.' });

          const user = { id: this.lastID, username, email, role: 'user' };
          const token = jwt.sign(user, getJwtSecret(), { expiresIn: '7d' });
          setAuthCookie(res, token);
          res.status(201).json({ message: 'Compte créé avec succès.', user });
        }
      );
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.post('/login', authLimiter, (req, res) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });
      if (!user) return res.status(401).json({ error: 'Identifiants invalides.' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Identifiants invalides.' });
      }

      const userPayload = buildUserPayload(user);
      const token = jwt.sign(userPayload, getJwtSecret(), { expiresIn: '7d' });
      setAuthCookie(res, token);
      res.json({ message: 'Connecté avec succès.', user: userPayload });
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: buildUserPayload(req.user) });
});

router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('auth_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    path: '/'
  });
  res.json({ message: 'Déconnecté avec succès.' });
});

router.post('/create-admin', authLimiter, async (req, res) => {
  if (process.env.ALLOW_ADMIN_BOOTSTRAP !== 'true') {
    return res.status(404).json({ error: 'Route désactivée.' });
  }

  const bootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!bootstrapToken || bootstrapToken.length < 32) {
    return res.status(500).json({ error: 'Configuration admin invalide.' });
  }

  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password, confirmPassword, adminKey } = req.body;

    if (adminKey !== bootstrapToken) {
      return res.status(403).json({ error: 'Clé admin invalide.' });
    }
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }
    if (!isValidUsername(username)) {
      return res.status(400).json({ error: 'Nom d\'utilisateur invalide.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir entre 10 et 128 caractères.' });
    }

    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });
      if (row) return res.status(400).json({ error: 'Un utilisateur avec ce nom ou cet email existe déjà.' });

      const hashedPassword = await bcrypt.hash(password, 12);
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'admin'],
        function(insertErr) {
          if (insertErr) return res.status(500).json({ error: 'Erreur lors de la création du compte admin.' });

          const user = { id: this.lastID, username, email, role: 'admin' };
          const token = jwt.sign(user, getJwtSecret(), { expiresIn: '7d' });
          setAuthCookie(res, token);
          res.status(201).json({ message: 'Compte admin créé avec succès.', user });
        }
      );
    });
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.post('/change-password', authLimiter, authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir entre 10 et 128 caractères.' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

      const validOldPassword = await bcrypt.compare(oldPassword, user.password);
      if (!validOldPassword) return res.status(401).json({ error: 'Ancien mot de passe incorrect.' });

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function(updateErr) {
        if (updateErr) return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
        res.json({ message: 'Mot de passe changé avec succès.' });
      });
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
