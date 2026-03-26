# 📊 Calculateur d'Heures v2.0

**Application web de suivi des heures avec authentification, base de données et interface moderne.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-blue.svg)](https://nodejs.org/)

---

## 🚀 Démarrage rapide

### Installation (3 minutes)
`ash
git clone https://github.com/votre_user/calcul-heure.git
cd calcul-heure
npm install
`

### Configuration
Créer un fichier .env :
`env
PORT=3000
DB_PATH=./database.db
JWT_SECRET=votre_clé_secrète_très_sûre_ici_32_caractères_minimum
NODE_ENV=production
`

### Lancement
`ash
npm start
`
**Accès :** http://localhost:3000

---

## ✨ Fonctionnalités

- 🔐 **Authentification** complète (inscription/connexion)
- 📅 **Saisie d'heures** avec calcul automatique des salaires
- 💾 **Stockage sécurisé** (SQLite + hashage bcrypt)
- 👨‍💼 **Espace admin** complet (gestion utilisateurs, statistiques)
- 📱 **Interface moderne** (glassmorphism, responsive)
- 🚀 **Déploiement prêt** (VestaCP/FiveHosting)

---

## 🛠️ Technologies

- **Backend** : Node.js + Express
- **Base de données** : SQLite3
- **Authentification** : JWT + bcrypt
- **Frontend** : HTML5/CSS3/JavaScript
- **Déploiement** : PM2 + Nginx

---

## � API Endpoints

### Authentification
- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion
- POST /api/auth/create-admin - Créer admin (clé requise)

### Entrées de travail
- GET /api/entries - Lister mes entrées
- POST /api/entries - Ajouter une entrée
- PUT /api/entries/:id - Modifier une entrée
- DELETE /api/entries/:id - Supprimer une entrée

### Admin (réservé)
- GET /api/admin/users - Gestion utilisateurs
- GET /api/admin/stats - Statistiques globales
- GET /api/admin/entries - Toutes les entrées
- DELETE /api/admin/users/:id - Supprimer utilisateur

---

## 🚀 Déploiement VestaCP (FiveHosting)

### 1. Upload des fichiers
Uploader tous les fichiers dans public_html/

### 2. Installation des dépendances
`ash
cd public_html
npm install --production
`

### 3. Configuration Nginx
Dans VestaCP > Web > Settings pour votre domaine :

`
# Configuration Nginx personnalisée
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
    proxy_set_header X-Real-IP ;
    proxy_set_header X-Forwarded-For ;
    proxy_set_header X-Forwarded-Proto ;
}
`

### 4. Démarrage avec PM2
`ash
# Installation PM2 globale
npm install -g pm2

# Configuration PM2
pm2 start server.js --name "calcul-heure"

# Sauvegarde et démarrage automatique
pm2 save
pm2 startup
`

### 5. Création admin
`ash
curl -X POST http://votre-domaine.com/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "votre_clé_secrète_admin"}'
`

**Connexion admin :** dmin / dmin123

---

## 🔧 Dépannage

### Port 3000 déjà utilisé
`ash
# Vérifier le processus
sudo lsof -i :3000

# Tuer le processus
sudo kill -9 <PID>
`

### Base de données corrompue
`ash
# Supprimer et recréer
rm database.db
npm start  # Recréation automatique
`

### PM2 ne démarre pas
`ash
pm2 kill
pm2 start server.js --name "calcul-heure"
`

---

## 📄 Licence

MIT - Utilisation libre pour projets personnels et commerciaux.

---

**Prêt pour la production ! 🎉**
