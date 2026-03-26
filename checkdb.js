const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READONLY);

db.all('SELECT id, username, email, role FROM users', [], (err, rows) => {
  if (err) {
    console.error('ERR', err);
    process.exit(1);
  }
  console.log('USERS', rows);
  db.close();
});