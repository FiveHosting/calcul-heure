function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  return typeof username === 'string' && /^[A-Za-z0-9_-]{3,30}$/.test(username);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 10 && password.length <= 128;
}

function isValidDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

function isValidTime(value) {
  return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeDescription(description) {
  if (description === undefined || description === null) return '';
  return String(description).trim().slice(0, 1000);
}

function parsePositiveRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate <= 0 || rate > 100000) return null;
  return Math.round(rate * 100) / 100;
}

function parsePositiveInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

module.exports = {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  isValidDate,
  isValidTime,
  normalizeDescription,
  parsePositiveRate,
  parsePositiveInt
};
