const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (row) {
        return res.status(400).json({ error: 'Un utilisateur avec ce nom ou cet email existe déjà' });
      }

      // Hash le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Ajouter l'utilisateur à la BDD
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la création du compte' });
          }

          // Générer un token JWT
          const token = jwt.sign(
            { id: this.lastID, username, email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'Compte créé avec succès',
            token,
            user: { id: this.lastID, username, email, role: 'user' }
          });
        }
      );
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Générer un token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Connecté avec succès',
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un compte admin (route spéciale pour initialisation)
router.post('/create-admin', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, adminKey } = req.body;

    // Clé secrète pour créer un admin (à changer en production)
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin-secret-key-2024';

    if (adminKey !== ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: 'Clé admin invalide' });
    }

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (row) {
        return res.status(400).json({ error: 'Un utilisateur avec ce nom ou cet email existe déjà' });
      }

      // Hash le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Ajouter l'admin à la BDD
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'admin'],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erreur lors de la création du compte admin' });
          }

          // Générer un token JWT
          const token = jwt.sign(
            { id: this.lastID, username, email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'Compte admin créé avec succès',
            token,
            user: { id: this.lastID, username, email, role: 'admin' }
          });
        }
      );
    });

  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
