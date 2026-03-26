const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', async (err) => {
  if (err) {
    console.error('Erreur DB:', err);
    process.exit(1);
  }
  
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      `INSERT OR REPLACE INTO users (id, username, email, password, role) 
       VALUES (2, ?, ?, ?, 'admin')`,
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          console.error('Erreur insertion admin:', err);
        } else {
          console.log(`✅ Admin créé/mis à jour : ${username} / ${password}`);
          console.log(`✅ Email : ${email}`);
          console.log(`✅ Hash : ${hashedPassword.substring(0, 20)}...`);
        }
        db.close();
        process.exit(err ? 1 : 0);
      }
    );
  } catch (err) {
    console.error('Erreur hash:', err);
    db.close();
    process.exit(1);
  }
});