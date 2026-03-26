const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la BDD:', err);
  } else {
    console.log('✅ Connecté à la base de données SQLite');
    initializeDatabase();
    ensureAdminUser();
  }
});

// Initialiser les tables
function initializeDatabase() {
  // Table des utilisateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Erreur création table users:', err);
    else console.log('✅ Table users initialisée');
  });

  // Table des entrées de travail
  db.run(`
    CREATE TABLE IF NOT EXISTS work_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      hourly_rate REAL NOT NULL,
      description TEXT,
      hours INTEGER,
      minutes INTEGER,
      total_hours REAL,
      salary REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Erreur création table work_entries:', err);
    else console.log('✅ Table work_entries initialisée');
  });
}

function ensureAdminUser() {
  const adminUsername = process.env.ADMIN_USER || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASS || 'admin123';

  // Forcer l'admin avec le bon hash
  bcrypt.hash(adminPassword, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error('Erreur hash admin:', hashErr);
      return;
    }

    // Vérifier d'abord si l'admin existe
    db.get('SELECT id FROM users WHERE id = 1', (err, row) => {
      if (row) {
        console.log('✅ Admin existe déjà, mot de passe préservé');
        return;
      }
      
      // Créer l'admin seulement s'il n'existe pas
      db.run(
        `INSERT INTO users (id, username, email, password, role, created_at) 
         VALUES (1, ?, ?, ?, 'admin', CURRENT_TIMESTAMP)`,
        [adminUsername, adminEmail, hashedPassword],
        function(insertErr) {
          if (insertErr) {
            console.error('Erreur création admin:', insertErr);
          } else {
            console.log(`✅ Admin créé en base: ${adminUsername}`);
          }
        }
      );
    });
  });
}


module.exports = db;
