# 🚀 Calculateur d'Heures — SaaS sécurisé & moderne

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express.js-Backend-black)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue)
![License](https://img.shields.io/badge/License-MIT-purple)
![Status](https://img.shields.io/badge/Status-Production-brightgreen)

Application web complète pour gérer ses heures de travail, calculer automatiquement ses revenus et administrer des utilisateurs.

> 🔐 Sécurité renforcée  
> 🌙 UI moderne dark mode  
> 📱 100% responsive mobile  
> ⚡ Expérience fluide type SaaS  

---

## ✨ Fonctionnalités

### 👤 Utilisateur
- Inscription / connexion sécurisée
- Ajout d’entrées de travail
- Calcul automatique :
  - durée
  - salaire
- Statistiques mensuelles
- Suppression d’entrées
- Changement de mot de passe

### 🛠️ Administrateur
- Gestion des utilisateurs
- Promotion / rétrogradation admin
- Suppression de comptes
- Statistiques globales

---

## 🔐 Sécurité

Ce projet a été renforcé côté backend et frontend :

- Cookie HttpOnly (plus de localStorage)
- CSP stricte (anti XSS)
- JWT sécurisé
- Validation serveur complète
- Protection brute-force basique
### Headers HTTP sécurisés :
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Aucun HTML injecté côté frontend

---

## 🧱 Stack technique

### Frontend
- HTML / CSS (design SaaS custom)
- JavaScript vanilla
-  Responsive mobile-first
### Backend
- Node.js
- Express
- SQLite

---
# 📂 Structure
---
```
/public
  ├── css/
  │   └── style.css
  ├── js/
  │   └── app.js
  └── index.html

/routes
  ├── auth.js
  ├── entries.js
  └── admin.js

/middleware
  └── auth.js

server.js
database.js
```
--- 
## ⚙️ Installation
--- 
```
git clone https://github.com/ton-user/calcul-heures.git  
cd calcul-heures  
npm install  
```
### Créer `.env`:
```
PORT=3000
DB_PATH=./database.db
NODE_ENV=production
JWT_SECRET=remplace_moi_par_une_cle_longue_aleatoire_de_32_caracteres_minimum
ALLOW_ADMIN_BOOTSTRAP=false
ADMIN_BOOTSTRAP_TOKEN=
ADMIN_USER=
ADMIN_EMAIL=
ADMIN_PASS=

```

Puis:
```
npm start  
```
---

## 👑 Crée un Admin
```
ADMIN_USER=admin ADMIN_EMAIL=admin@mail.com ADMIN_PASS='motdepassefort123' node setup-admin.js
```
---
# 📱 Responsive
---

- Mobile-first
- Dashboard fluide
- Admin optimisé (cards sur mobile)
- Pas de scroll horizontal cassé
### 🎨 UI / UX
- Design SaaS moderne (Notion / Stripe)
- Dark mode premium
- Animations fluides
- Glassmorphism léger

# 👨‍💻 Auteur

Développé avec ❤️ par Jo

## ⭐ Licence

MIT
