const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET est manquant ou trop court. Utilisez au moins 32 caractères.');
  }
  return secret;
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) return acc;
    acc[rawName] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies.auth_token || null;
}

const authenticateToken = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  jwt.verify(token, getJwtSecret(), (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session invalide ou expirée' });
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, getJwtSecret };
