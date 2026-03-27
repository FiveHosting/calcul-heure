require('dotenv').config();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { isValidEmail, isValidPassword, isValidUsername } = require('./validation');

const username = process.env.ADMIN_USER;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASS;
const dbPath = process.env.DB_PATH ? path.resolve(process.cwd(), process.env.DB_PATH) : path.join(__dirname, 'database.db');

if (!isValidUsername(username || '')) {
  console.error('ADMIN_USER invalide. Utilisez 3 à 30 caractères: lettres, chiffres, _ ou -.');
  process.exit(1);
}
if (!isValidEmail(email || '')) {
  console.error('ADMIN_EMAIL invalide.');
  process.exit(1);
}
if (!isValidPassword(password || '')) {
  console.error('ADMIN_PASS invalide. Utilisez 10 à 128 caractères.');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Erreur DB:', err);
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    db.run(
      `INSERT INTO users (username, email, password, role)
       VALUES (?, ?, ?, 'admin')
       ON CONFLICT(email) DO UPDATE SET username = excluded.username, password = excluded.password, role = 'admin'`,
      [username, email.toLowerCase(), hashedPassword],
      function(insertErr) {
        if (insertErr) {
          console.error('Erreur insertion admin:', insertErr);
          process.exitCode = 1;
        } else {
          console.log(`✅ Admin créé/mis à jour : ${username} (${email.toLowerCase()})`);
        }
        db.close();
      }
    );
  } catch (hashErr) {
    console.error('Erreur hash:', hashErr);
    db.close();
    process.exit(1);
  }
});
