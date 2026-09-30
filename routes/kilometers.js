const express = require('express');
const db = require('../database');
const { isValidDate, normalizeDescription, parsePositiveInt, parsePositiveRate } = require('../validation');

const router = express.Router();

function mapTrip(row) {
  return {
    id: row.id,
    date: row.date,
    kilometers: row.kilometers,
    reason: row.reason,
    source: row.source,
    startAddress: row.start_address || '',
    endAddress: row.end_address || '',
    createdAt: row.created_at
  };
}

function validateTrip(body) {
  const date = typeof body.date === 'string' ? body.date.trim() : '';
  const kilometers = parsePositiveRate(body.kilometers);
  const reason = normalizeDescription(body.reason);
  const source = body.source === 'gps' ? 'gps' : 'manual';
  const startAddress = normalizeDescription(body.startAddress);
  const endAddress = normalizeDescription(body.endAddress);
  if (!isValidDate(date)) return { error: 'Date invalide.' };
  if (kilometers === null) return { error: 'Kilométrage invalide.' };
  if (!reason) return { error: 'Motif du déplacement requis.' };
  return { value: { date, kilometers, reason, source, startAddress, endAddress } };
}

router.get('/', (req, res) => {
  db.all(`SELECT id, date, kilometers, reason, source, start_address, end_address, created_at FROM kilometer_trips WHERE user_id = ? ORDER BY date DESC, id DESC`, [req.user.id], (error, rows) => {
    if (error) return res.status(500).json({ error: 'Erreur lors du chargement des trajets.' });
    return res.json((rows || []).map(mapTrip));
  });
});

router.post('/', (req, res) => {
  const validation = validateTrip(req.body);
  if (validation.error) return res.status(400).json({ error: validation.error });
  const trip = validation.value;
  db.run(`INSERT INTO kilometer_trips (user_id, date, kilometers, reason, source, start_address, end_address) VALUES (?, ?, ?, ?, ?, ?, ?)`, [req.user.id, trip.date, trip.kilometers, trip.reason, trip.source, trip.startAddress, trip.endAddress], function(error) {
    if (error) return res.status(500).json({ error: 'Erreur lors de l’enregistrement du trajet.' });
    return res.status(201).json({ message: 'Trajet enregistré.', trip: { id: this.lastID, ...trip } });
  });
});

router.delete('/:id', (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Identifiant invalide.' });
  db.run('DELETE FROM kilometer_trips WHERE id = ? AND user_id = ?', [id, req.user.id], function(error) {
    if (error) return res.status(500).json({ error: 'Erreur lors de la suppression du trajet.' });
    if (!this.changes) return res.status(404).json({ error: 'Trajet introuvable.' });
    return res.json({ message: 'Trajet supprimé.' });
  });
});

module.exports = router;
