const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { isValidDate, isValidTime, normalizeDescription, parsePositiveInt, parsePositiveRate } = require('../validation');

const router = express.Router();
const MAX_BULK_ENTRIES = 25;

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

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

function prepareEntry(value) {
  const timeCalc = calculateHours(value.startTime, value.endTime);
  const totalHours = timeCalc.totalMinutes / 60;
  const salary = Math.round(totalHours * value.hourlyRate * 100) / 100;

  return {
    ...value,
    hours: timeCalc.hours,
    minutes: timeCalc.minutes,
    totalHours,
    salary
  };
}

async function insertEntry(userId, entry) {
  const result = await runQuery(
    `INSERT INTO work_entries (user_id, date, start_time, end_time, hourly_rate, description, hours, minutes, total_hours, salary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      entry.date,
      entry.startTime,
      entry.endTime,
      entry.hourlyRate,
      entry.description,
      entry.hours,
      entry.minutes,
      entry.totalHours,
      entry.salary
    ]
  );

  return {
    id: result.lastID,
    user_id: userId,
    ...entry
  };
}

router.post('/bulk', authenticateToken, async (req, res) => {
  const date = typeof req.body.date === 'string' ? req.body.date.trim() : '';
  const rows = Array.isArray(req.body.entries) ? req.body.entries : [];

  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'Date invalide.' });
  }
  if (!rows.length || rows.length > MAX_BULK_ENTRIES) {
    return res.status(400).json({
      error: `Vous devez envoyer entre 1 et ${MAX_BULK_ENTRIES} créneaux.`
    });
  }

  const entries = [];

  for (let index = 0; index < rows.length; index += 1) {
    const validation = validateEntryPayload({ ...rows[index], date });
    if (validation.error) {
      return res.status(400).json({
        error: `Créneau ${index + 1} : ${validation.error}`
      });
    }
    entries.push(prepareEntry(validation.value));
  }

  let transactionStarted = false;

  try {
    await runQuery('BEGIN IMMEDIATE');
    transactionStarted = true;

    const createdEntries = [];
    for (const entry of entries) {
      createdEntries.push(await insertEntry(req.user.id, entry));
    }

    await runQuery('COMMIT');
    transactionStarted = false;

    return res.status(201).json({
      message: `${createdEntries.length} créneau${createdEntries.length > 1 ? 'x' : ''} ajouté${createdEntries.length > 1 ? 's' : ''} avec succès.`,
      count: createdEntries.length,
      entries: createdEntries
    });
  } catch (error) {
    if (transactionStarted) {
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackError) {
        console.error('Erreur rollback entrées multiples:', rollbackError);
      }
    }

    console.error('Erreur entrées multiples:', error);
    return res.status(500).json({ error: 'Erreur lors de l’ajout des créneaux.' });
  }
});

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

router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  const entryId = parsePositiveInt(req.params.id);
  const date = typeof req.body.date === 'string' ? req.body.date.trim() : '';

  if (!entryId) return res.status(400).json({ error: 'Identifiant invalide.' });
  if (!isValidDate(date)) return res.status(400).json({ error: 'Date invalide.' });

  try {
    const source = await getQuery(
      `SELECT start_time, end_time, hourly_rate, description
       FROM work_entries
       WHERE id = ? AND user_id = ?`,
      [entryId, req.user.id]
    );

    if (!source) return res.status(404).json({ error: 'Entrée non trouvée.' });

    const validation = validateEntryPayload({
      date,
      startTime: source.start_time,
      endTime: source.end_time,
      hourlyRate: source.hourly_rate,
      description: source.description
    });

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const createdEntry = await insertEntry(req.user.id, prepareEntry(validation.value));
    return res.status(201).json({
      message: 'Créneau dupliqué avec succès.',
      entry: createdEntry
    });
  } catch (error) {
    console.error('Erreur duplication entrée:', error);
    return res.status(500).json({ error: 'Erreur lors de la duplication.' });
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
