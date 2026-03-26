require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Journalisation des requêtes API
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/admin', adminRoutes);

// Route pour favicon
app.get('/favicon.ico', (req, res) => {
  res.sendStatus(204);
});

// Route pour servir l'app HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Base de données: ./database.db`);
});

// Gestion de l'arrêt gracieux
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Base de données fermée');
    process.exit(0);
  });
});
