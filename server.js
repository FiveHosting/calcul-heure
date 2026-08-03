require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const adminRoutes = require('./routes/admin');
const { authenticateToken, getJwtSecret } = require('./middleware/auth');

getJwtSecret();

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const staticAssetOptions = {
  index: false,
  extensions: false,
  redirect: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    } else if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
};

function getAllowedCorsOrigins() {
  const defaults = ['capacitor://localhost', 'ionic://localhost', 'http://localhost', 'https://localhost'];
  const configured = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...defaults, ...configured]);
}

const allowedCorsOrigins = getAllowedCorsOrigins();
const apiCors = cors({
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Platform'],
  origin(origin, callback) {
    if (!origin || allowedCorsOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  }
});

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
app.use('/api', apiCors);

app.use('/public', express.static(publicDir, staticAssetOptions));
app.use('/css', express.static(path.join(publicDir, 'css'), staticAssetOptions));
app.use('/js', express.static(path.join(publicDir, 'js'), staticAssetOptions));
app.use('/assets', express.static(path.join(publicDir, 'assets'), staticAssetOptions));

app.use('/api/auth', authRoutes);
app.use('/api/entries', authenticateToken, entriesRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get(['/privacy', '/privacy.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(publicDir, 'privacy.html'));
});

app.get('/manifest.webmanifest', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.type('application/manifest+json');
  res.sendFile(path.join(publicDir, 'manifest.webmanifest'));
});

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
