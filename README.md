# 🚀 Calculateur d'Heures — SaaS sécurisé & moderne

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue?logo=sqlite)
![Status](https://img.shields.io/badge/Status-Production-success)
![License](https://img.shields.io/badge/License-MIT-purple)

> Application web SaaS permettant de gérer ses heures de travail, calculer ses revenus et administrer des utilisateurs.

---

# 🇫🇷 Documentation Française

## 🚀 Présentation

**Calculateur d’Heures** est une application web complète permettant :

- le suivi du temps de travail
- le calcul automatique des revenus
- la gestion d’utilisateurs
- une interface moderne type SaaS

👉 Objectif : **simplicité + sécurité + performance**

---

## ✨ Fonctionnalités

### 👤 Utilisateur

- Inscription / connexion sécurisée
- Ajout d’entrées de travail
- Calcul automatique :
  - durée travaillée
  - salaire généré
- Statistiques mensuelles
- Suppression d’entrées
- Modification du mot de passe

---

### 🛠️ Administrateur

- Gestion complète des utilisateurs
- Promotion / rétrogradation admin
- Suppression de comptes
- Accès aux statistiques globales

---

## 🔐 Sécurité

Application sécurisée côté backend et frontend :

### 🔒 Protections principales

- Cookies **HttpOnly** (aucun token en localStorage)
- JWT sécurisé
- Validation serveur stricte
- Protection basique brute-force
- Aucune injection HTML côté frontend

### 🛡️ Headers HTTP

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- CSP stricte (anti XSS)

---

## 🧱 Stack technique

### Frontend

- HTML / CSS (design SaaS custom)
- JavaScript vanilla
- Responsive mobile-first

### Backend

- Node.js 18+
- Express
- SQLite

---

## 📁 Structure du projet

```bash
.
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
│
├── routes/
│   ├── auth.js
│   ├── entries.js
│   └── admin.js
│
├── middleware/
│   └── auth.js
│
├── server.js
├── database.js
├── setup-admin.js
└── README.md
````

---

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone https://github.com/FiveHosting/calcul-heure.git
cd calcul-heure
npm install
```

---

### 2. Configuration `.env`

Créer un fichier `.env` :

```env
PORT=3000
DB_PATH=./database.db
NODE_ENV=production

JWT_SECRET=cle_super_secrete_32_caracteres_minimum

ALLOW_ADMIN_BOOTSTRAP=false
ADMIN_BOOTSTRAP_TOKEN=

ADMIN_USER=
ADMIN_EMAIL=
ADMIN_PASS=
```

---

### 3. Lancer l’application

```bash
npm start
```

---

## 👑 Création d’un administrateur

```bash
ADMIN_USER=admin \
ADMIN_EMAIL=admin@mail.com \
ADMIN_PASS='motdepassefort123' \
node setup-admin.js
```

---

## 📱 Interface & UX

* 📱 Mobile-first
* 🌙 Dark mode moderne
* ⚡ UI fluide
* 💎 Design SaaS inspiré de Notion / Stripe
* 🎨 Animations légères

---

## 🧪 Debug

### Si le serveur ne démarre pas

* Vérifier `.env`
* Vérifier port libre
* Vérifier `JWT_SECRET`

### Si login ne fonctionne pas

* Vérifier cookies activés
* Vérifier base SQLite

---

## 🔒 Sécurité

### ❌ Ne jamais commit :

```
.env
database.db
JWT secrets
```

### ✔️ À sécuriser :

* JWT_SECRET
* accès admin
* base de données

---

## 📈 Améliorations possibles

* Dashboard analytics avancé
* Export PDF / CSV
* Multi-utilisateurs (teams)
* API REST publique
* Auth 2FA
* Logs avancés

---

# 🇬🇧 English Documentation

## 🚀 Overview

**Hour Calculator** is a modern SaaS-style web app to:

* track working hours
* automatically calculate earnings
* manage users securely

---

## ✨ Features

### 👤 User

* Secure login / register
* Add work entries
* Automatic:

  * duration calculation
  * salary calculation
* Monthly stats
* Delete entries
* Change password

---

### 🛠️ Admin

* User management
* Promote / demote admins
* Delete accounts
* Global stats

---

## 🔐 Security

* HttpOnly cookies (no localStorage)
* Secure JWT
* Server-side validation
* Basic brute-force protection
* Strict CSP

---

## 🧱 Stack

* Node.js
* Express
* SQLite
* Vanilla JS frontend

---

## ⚙️ Installation

```bash
git clone https://github.com/FiveHosting/calcul-heure.git
cd calcul-heure
npm install
```

---

## ▶️ Start

```bash
npm start
```

---

## 👨‍💻 Author

Developed by **Jo**

---

## ⭐ License

MIT

---
