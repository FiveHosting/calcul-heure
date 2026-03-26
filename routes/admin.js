const express = require('express');
const db = require('../database');

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

// Obtenir tous les utilisateurs (admin seulement)
router.get('/users', requireAdmin, (req, res) => {
  db.all(`
    SELECT id, username, email, role, created_at,
           (SELECT COUNT(*) FROM work_entries WHERE user_id = users.id) as total_entries,
           (SELECT SUM(salary) FROM work_entries WHERE user_id = users.id) as total_salary,
           (SELECT SUM(total_hours) FROM work_entries WHERE user_id = users.id) as total_hours
    FROM users
    ORDER BY created_at DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({users: rows || []});
  });
});

// Obtenir les statistiques globales (admin seulement)
router.get('/stats', requireAdmin, (req, res) => {
  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    totalEntries: 'SELECT COUNT(*) as count FROM work_entries',
    totalHours: 'SELECT SUM(total_hours) as total FROM work_entries',
    totalSalary: 'SELECT SUM(salary) as total FROM work_entries',
    recentEntries: `
      SELECT we.*, u.username
      FROM work_entries we
      JOIN users u ON we.user_id = u.id
      ORDER BY we.created_at DESC
      LIMIT 10
    `,
    monthlyStats: `
      SELECT
        strftime('%Y-%m', date) as month,
        COUNT(*) as entries,
        SUM(total_hours) as hours,
        SUM(salary) as salary
      FROM work_entries
      WHERE date >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
    `
  };

  const results = {};

  const executeQuery = (key, query, callback) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`Erreur query ${key}:`, err);
        results[key] = null;
      } else {
        results[key] = rows;
      }
      callback();
    });
  };

  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    executeQuery(key, query, () => {
      completed++;
      if (completed === totalQueries) {
        res.json({
          totalUsers: results.totalUsers?.[0]?.count || 0,
          totalEntries: results.totalEntries?.[0]?.count || 0,
          totalHours: results.totalHours?.[0]?.total || 0,
          totalSalary: results.totalSalary?.[0]?.total || 0,
          recentEntries: results.recentEntries || [],
          monthlyStats: results.monthlyStats || []
        });
      }
    });
  });
});

// Changer le rôle d'un utilisateur (admin seulement)
router.put('/users/:id/role', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }

  // Empêcher un admin de se retirer ses propres droits
  if (parseInt(id) === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' });
  }

  db.run('UPDATE users SET role = ? WHERE id = ?', [role, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Rôle mis à jour avec succès' });
  });
});

// Supprimer un utilisateur (admin seulement)
router.delete('/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  // Empêcher la suppression de son propre compte
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  });
});

// Obtenir toutes les entrées de travail (admin seulement)
router.get('/entries', requireAdmin, (req, res) => {
  const { userId, month } = req.query;

  let query = `
    SELECT we.*, u.username, u.email
    FROM work_entries we
    JOIN users u ON we.user_id = u.id
  `;
  const params = [];

  if (userId) {
    query += ' WHERE we.user_id = ?';
    params.push(userId);
  }

  if (month) {
    query += userId ? ' AND' : ' WHERE';
    query += ' we.date LIKE ?';
    params.push(`${month}%`);
  }

  query += ' ORDER BY we.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json({entries: rows || []});
  });
});

module.exports = router;