const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Calculer les heures travaillées
function calculateHours(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Si l'heure de fin est plus petite, c'est un horaire de nuit
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const totalMinutes = endMinutes - startMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, totalMinutes };
}

// Ajouter une entrée de travail
router.post('/', authenticateToken, (req, res) => {
  try {
    const { date, startTime, endTime, hourlyRate, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!date || !startTime || !endTime || !hourlyRate) {
      return res.status(400).json({ error: 'Données incomplètes' });
    }

    if (hourlyRate <= 0) {
      return res.status(400).json({ error: 'Le taux horaire doit être positif' });
    }

    const timeCalc = calculateHours(startTime, endTime);
    const totalHours = timeCalc.totalMinutes / 60;
    const salary = totalHours * hourlyRate;

    db.run(
      `INSERT INTO work_entries (user_id, date, start_time, end_time, hourly_rate, description, hours, minutes, total_hours, salary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, date, startTime, endTime, hourlyRate, description || '', timeCalc.hours, timeCalc.minutes, totalHours, salary],
      function(err) {
        if (err) {
          console.error('Erreur ajout entrée:', err);
          return res.status(500).json({ error: 'Erreur lors de l\'ajout' });
        }

        res.status(201).json({
          message: 'Entrée ajoutée avec succès',
          entry: {
            id: this.lastID,
            user_id: userId,
            date,
            startTime,
            endTime,
            hourlyRate,
            description,
            hours: timeCalc.hours,
            minutes: timeCalc.minutes,
            totalHours,
            salary
          }
        });
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer toutes les entrées de l'utilisateur
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    db.all(
      'SELECT * FROM work_entries WHERE user_id = ? ORDER BY date DESC',
      [userId],
      (err, rows) => {
        if (err) {
          console.error('Erreur récupération:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        const entries = rows.map(row => ({
          id: row.id,
          date: row.date,
          startTime: row.start_time,
          endTime: row.end_time,
          hourlyRate: row.hourly_rate,
          description: row.description,
          hours: row.hours,
          minutes: row.minutes,
          totalHours: row.total_hours,
          salary: row.salary,
          createdAt: row.created_at
        }));

        res.json(entries);
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les entrées d'un mois spécifique
router.get('/:month', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.params.month; // format: YYYY-MM

    db.all(
      'SELECT * FROM work_entries WHERE user_id = ? AND date LIKE ? ORDER BY date DESC',
      [userId, month + '%'],
      (err, rows) => {
        if (err) {
          console.error('Erreur récupération:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        const entries = rows.map(row => ({
          id: row.id,
          date: row.date,
          startTime: row.start_time,
          endTime: row.end_time,
          hourlyRate: row.hourly_rate,
          description: row.description,
          hours: row.hours,
          minutes: row.minutes,
          totalHours: row.total_hours,
          salary: row.salary,
          createdAt: row.created_at
        }));

        res.json(entries);
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une entrée
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user.id;

    // Vérifier que l'entrée appartient à l'utilisateur
    db.get(
      'SELECT * FROM work_entries WHERE id = ? AND user_id = ?',
      [entryId, userId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (!row) {
          return res.status(404).json({ error: 'Entrée non trouvée' });
        }

        db.run(
          'DELETE FROM work_entries WHERE id = ? AND user_id = ?',
          [entryId, userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Erreur lors de la suppression' });
            }

            res.json({ message: 'Entrée supprimée avec succès' });
          }
        );
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour une entrée
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user.id;
    const { date, startTime, endTime, hourlyRate, description } = req.body;

    if (!date || !startTime || !endTime || !hourlyRate) {
      return res.status(400).json({ error: 'Données incomplètes' });
    }

    const timeCalc = calculateHours(startTime, endTime);
    const totalHours = timeCalc.totalMinutes / 60;
    const salary = totalHours * hourlyRate;

    db.run(
      `UPDATE work_entries 
       SET date = ?, start_time = ?, end_time = ?, hourly_rate = ?, description = ?, 
           hours = ?, minutes = ?, total_hours = ?, salary = ?
       WHERE id = ? AND user_id = ?`,
      [date, startTime, endTime, hourlyRate, description || '', timeCalc.hours, timeCalc.minutes, totalHours, salary, entryId, userId],
      function(err) {
        if (err) {
          console.error('Erreur mise à jour:', err);
          return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Entrée non trouvée' });
        }

        res.json({
          message: 'Entrée mise à jour avec succès',
          entry: {
            id: entryId,
            date,
            startTime,
            endTime,
            hourlyRate,
            description,
            hours: timeCalc.hours,
            minutes: timeCalc.minutes,
            totalHours,
            salary
          }
        });
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
