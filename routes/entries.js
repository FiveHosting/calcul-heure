const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { isValidDate, isValidTime, normalizeDescription, parsePositiveInt, parsePositiveRate } = require('../validation');

const router = express.Router();

function calculateHours(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const totalMinutes = endMinutes - startMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, totalMinutes };
}

function validateEntryPayload(body) {
  const date = typeof body.date === 'string' ? body.date.trim() : '';
  const startTime = typeof body.startTime === 'string' ? body.startTime.trim() : '';
  const endTime = typeof body.endTime === 'string' ? body.endTime.trim() : '';
  const hourlyRate = parsePositiveRate(body.hourlyRate);
  const description = normalizeDescription(body.description);

  if (!date || !startTime || !endTime || hourlyRate === null) {
    return { error: 'Données incomplètes ou invalides.' };
  }
  if (!isValidDate(date)) return { error: 'Date invalide.' };
  if (!isValidTime(startTime) || !isValidTime(endTime)) return { error: 'Heure invalide.' };

  return { value: { date, startTime, endTime, hourlyRate, description } };
}

router.post('/', authenticateToken, (req, res) => {
  try {
    const validation = validateEntryPayload(req.body);
    if (validation.error) return res.status(400).json({ error: validation.error });

    const { date, startTime, endTime, hourlyRate, description } = validation.value;
    const userId = req.user.id;
    const timeCalc = calculateHours(startTime, endTime);
    const totalHours = timeCalc.totalMinutes / 60;
    const salary = Math.round(totalHours * hourlyRate * 100) / 100;

    db.run(
      `INSERT INTO work_entries (user_id, date, start_time, end_time, hourly_rate, description, hours, minutes, total_hours, salary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, date, startTime, endTime, hourlyRate, description, timeCalc.hours, timeCalc.minutes, totalHours, salary],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erreur lors de l\'ajout.' });

        res.status(201).json({
          message: 'Entrée ajoutée avec succès.',
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
    console.error('Erreur entrée:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.get('/', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM work_entries WHERE user_id = ? ORDER BY date DESC, id DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });
      res.json((rows || []).map((row) => ({
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
      })));
    }
  );
});

router.get('/:month', authenticateToken, (req, res) => {
  const month = typeof req.params.month === 'string' ? req.params.month.trim() : '';
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Mois invalide.' });
  }

  db.all(
    'SELECT * FROM work_entries WHERE user_id = ? AND date LIKE ? ORDER BY date DESC, id DESC',
    [req.user.id, `${month}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });
      res.json((rows || []).map((row) => ({
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
      })));
    }
  );
});

router.delete('/:id', authenticateToken, (req, res) => {
  const entryId = parsePositiveInt(req.params.id);
  if (!entryId) return res.status(400).json({ error: 'Identifiant invalide.' });

  db.get('SELECT id FROM work_entries WHERE id = ? AND user_id = ?', [entryId, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!row) return res.status(404).json({ error: 'Entrée non trouvée.' });

    db.run('DELETE FROM work_entries WHERE id = ? AND user_id = ?', [entryId, req.user.id], function(deleteErr) {
      if (deleteErr) return res.status(500).json({ error: 'Erreur lors de la suppression.' });
      res.json({ message: 'Entrée supprimée avec succès.' });
    });
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  const entryId = parsePositiveInt(req.params.id);
  if (!entryId) return res.status(400).json({ error: 'Identifiant invalide.' });

  const validation = validateEntryPayload(req.body);
  if (validation.error) return res.status(400).json({ error: validation.error });

  const { date, startTime, endTime, hourlyRate, description } = validation.value;
  const timeCalc = calculateHours(startTime, endTime);
  const totalHours = timeCalc.totalMinutes / 60;
  const salary = Math.round(totalHours * hourlyRate * 100) / 100;

  db.run(
    `UPDATE work_entries
     SET date = ?, start_time = ?, end_time = ?, hourly_rate = ?, description = ?,
         hours = ?, minutes = ?, total_hours = ?, salary = ?
     WHERE id = ? AND user_id = ?`,
    [date, startTime, endTime, hourlyRate, description, timeCalc.hours, timeCalc.minutes, totalHours, salary, entryId, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
      if (this.changes === 0) return res.status(404).json({ error: 'Entrée non trouvée.' });

      res.json({
        message: 'Entrée mise à jour avec succès.',
        entry: { id: entryId, date, startTime, endTime, hourlyRate, description, hours: timeCalc.hours, minutes: timeCalc.minutes, totalHours, salary }
      });
    }
  );
});

module.exports = router;
