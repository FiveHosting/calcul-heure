# 📋 Index du projet - Calculateur d'Heures v2.0

## 🎯 Vue d'ensemble

**Calculateur d'Heures v2.0** est une application complète pour gérer et calculer les heures de travail avec:
- ✅ Authentification utilisateur sécurisée
- ✅ Base de données SQLite  
- ✅ API REST avec Node.js/Express
- ✅ Interface web moderne
- ✅ Calcul automatique des salaires

## 📁 Structure des fichiers

### 🔧 Configuration et Démarrage

| Fichier | Description |
|---------|------------|
| `package.json` | Dépendances npm et scripts de démarrage |
| `package-lock.json` | Versions exactes des dépendances |
| `.env` | Variables d'environnement (PORT, JWT_SECRET, etc.) |
| `.gitignore` | Fichiers à ignorer pour git |

### 🖥️ Backend (Serveur)

| Fichier | Description |
|---------|------------|
| `server.js` | **Point d'entrée** - Démarre le serveur Express sur le port 3000 |
| `database.js` | Connexion SQLite et initialisation des tables |
| `middleware.js` | Middleware JWT pour authentification |
| `routes/auth.js` | Routes: `/api/auth/register` et `/api/auth/login` |
| `routes/entries.js` | Routes CRUD: GET/POST/PUT/DELETE pour les heures |

### 🎨 Frontend (Client)

| Fichier | Description |
|---------|------------|
| `index.html` | **Application complète** - Authentification + Tableau de bord |
| `index.backup.html` | Sauvegarde de l'ancienne version (v1) |

### 📚 Documentation

| Fichier | Description |
|---------|------------|
| `README.md` | **Documentation complète** - Installation, utilisation, API |
| `IMPLEMENTATION.md` | **Détails techniques** - Architecture, tables BDD, API endpoints |
| `DEMARRAGE.md` | **Guide rapide** - Comment démarrer en 3 étapes |
| `GUIDE-VISUEL.md` | **Guide utilisateur** - Écrans, flux, exemples API |
| `INDEX.md` | Ce fichier - Vue d'ensemble du projet |

### 💾 Données

| Fichier | Description |
|---------|------------|
| `database.db` | **Base de données SQLite** - Créée au premier démarrage |
| `node_modules/` | Dépendances npm installées |

## 🚀 Démarrage rapide (3 étapes)

### Étape 1: Installer
```bash
npm install
```

### Étape 2: Démarrer
```bash
npm start
```

### Étape 3: Accéder
```
http://localhost:3000
```

## 📊 Architecture du système

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (index.html)                │
│  ├─ UI Authentification (Login/Register)                │
│  ├─ Interface Tableau de bord                           │
│  └─ Requêtes via Fetch API                              │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP Requests (JSON)
┌────────────────▼────────────────────────────────────────┐
│               Backend (Express Server)                   │
│  ├─ Routes /api/auth/*        (server.js)               │
│  ├─ Routes /api/work/*        (server.js)               │
│  ├─ Middleware JWT auth       (middleware.js)           │
│  └─ CORS & Static Files       (server.js)               │
└────────────────┬────────────────────────────────────────┘
                 │ SQL Queries
┌────────────────▼────────────────────────────────────────┐
│              Database (SQLite3)                          │
│  ├─ Table: users                                        │
│  │   └─ id, username, email, password_hash, created_at  │
│  │                                                       │
│  └─ Table: work_entries                                 │
│      └─ id, user_id, date, hours, salary, ...           │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Sécurité

- ✅ Mots de passe hashés avec **bcrypt** (10 salts)
- ✅ Authentification par **JWT** (expire 7j)
- ✅ Tokens stockés de manière sécurisée
- ✅ Requêtes protégées par middleware
- ✅ Isolement des données par utilisateur
- ✅ CORS configuré

## 📡 API Endpoints

### Authentification
```
POST /api/auth/register   - Créer compte
POST /api/auth/login      - Se connecter
```

### Heures de travail
```
GET    /api/work/entries       - Toutes les entrées
GET    /api/work/entries/:month - Entrées du mois
POST   /api/work/entries       - Ajouter
PUT    /api/work/entries/:id   - Modifier
DELETE /api/work/entries/:id   - Supprimer
```

## 💾 Base de données

### Table users
```
id           | INTEGER PRIMARY KEY
username     | TEXT UNIQUE
email        | TEXT UNIQUE
password     | TEXT (hashé)
created_at   | TIMESTAMP
```

### Table work_entries
```
id           | INTEGER PRIMARY KEY
user_id      | INTEGER (FK → users)
date         | DATE
start_time   | TIME
end_time     | TIME
hourly_rate  | REAL
description  | TEXT
hours        | INTEGER
minutes      | INTEGER
total_hours  | REAL
salary       | REAL
created_at   | TIMESTAMP
```

## 🎯 Fonctionnalités

### Authentification
- ✅ Inscription avec validation
- ✅ Connexion sécurisée
- ✅ Déconnexion
- ✅ Persistance de session (token)

### Gestion des heures
- ✅ Ajouter une entrée
- ✅ Voir l'historique
- ✅ Filtrer par mois
- ✅ Modifier une entrée
- ✅ Supprimer une entrée
- ✅ Calculs automatiques salaire

### Interface
- ✅ Design moderne et responsive
- ✅ Messages d'alerte
- ✅ Validation des formulaires
- ✅ Statistiques mensuelles

## 🔧 Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite3** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hachage mots de passe
- **CORS** - Partage de ressources cross-origin

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **JavaScript ES6+** - Logique
- **Fetch API** - Requêtes HTTP

## 📝 Fichiers à personnaliser

1. **`.env`** - Changez le JWT_SECRET en production
2. **`package.json`** - Mettez à jour version et auteur
3. **`README.md`** - Adaptez la documentation à votre contexte

## 🐛 Dépannage

### Erreur: "Port 3000 already in use"
```bash
# Le serveur est déjà en cours d'exécution
# Changez le port dans .env:
PORT=3001
```

### Erreur: "Module not found"
```bash
# Réinstallez les dépendances
npm install
```

### Base de données vide
```bash
# Elle est créée automatiquement au premier démarrage
# Si problème, supprimez database.db et redémarrez
```

## 📈 Évolutions possibles

- [ ] Export PDF des rapports
- [ ] Graphiques statistiques
- [ ] Intégration calendrier
- [ ] Notifications email
- [ ] Mobile app
- [ ] Authentification OAuth
- [ ] Mode dark
- [ ] Multilangues

## 📞 Support et logs

Pour avoir plus d'informations:
```bash
# Démarrage avec logs détaillés
npm run dev
```

## 📋 Checklist de vérification

- [ ] `npm install` a réussi
- [ ] `npm start` démarre sans erreur
- [ ] `http://localhost:3000` est accessible
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Ajout d'entrée fonctionne
- [ ] Calcul du salaire correct
- [ ] Suppression d'entrée fonctionne
- [ ] Déconnexion efface le token

## 📄 Fichiers générés vs créés

**Fichiers créés par npm install:**
- `node_modules/` - Dépendances
- `package-lock.json` - Versions exactes

**Fichiers créés par l'app:**
- `database.db` - Base de données SQLite

**Fichiers créés manuellement:**
- Tous les autres

## 🎓 Pour apprendre davantage

**Consultez les documentations:**
1. `README.md` - Vue d'ensemble complète
2. `IMPLEMENTATION.md` - Détails techniques
3. `DEMARRAGE.md` - Guide de démarrage
4. `GUIDE-VISUEL.md` - Guide utilisateur

---

**Version:** 2.0.0  
**Date:** Mars 2026  
**Statut:** ✅ Production-Ready  

🎉 **Application complète et fonctionnelle!**
