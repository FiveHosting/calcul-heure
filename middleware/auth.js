const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
    if (err) {
      console.error('Token invalide:', err.message);
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }

    req.user = user; // Attacher l'utilisateur au request
    next();
  });
};

module.exports = { authenticateToken };
