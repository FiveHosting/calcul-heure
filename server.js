require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./database');
const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const adminRoutes = require('./routes/admin');
const { authenticateToken, getJwtSecret } = require('./middleware/auth');

getJwtSecret();

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com data:; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );
  next();
});

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(express.static(publicDir, {
  index: false,
  extensions: false,
  redirect: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/entries', authenticateToken, entriesRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

app.get('/favicon.ico', (req, res) => res.sendStatus(204));
app.get('/', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route non trouvée.' });
  }
  res.status(404).send('Page non trouvée.');
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Fichiers publics: ${publicDir}`);
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Base de données fermée');
    process.exit(0);
  });
});
