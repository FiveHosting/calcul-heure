# 🚀 Calculateur d'Heures — SaaS sécurisé & moderne

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue?logo=sqlite)
![Security](https://img.shields.io/badge/Security-Hardened-success)
![Status](https://img.shields.io/badge/Status-Production-success)
![License](https://img.shields.io/badge/License-MIT-purple)

> 🧠 Application SaaS moderne pour suivre ses heures de travail, calculer ses revenus et gérer des utilisateurs en toute sécurité.

---

# 🇫🇷 Documentation complète

---

## 🚀 Présentation

**Calculateur d’Heures** est une application web complète inspirée des standards SaaS modernes (Notion, Stripe), conçue pour :

- suivre précisément les heures de travail
- calculer automatiquement les revenus
- gérer plusieurs utilisateurs avec rôles
- offrir une expérience fluide et sécurisée

👉 Objectif : **performance, sécurité, simplicité**

---

## ✨ Fonctionnalités détaillées

### 👤 Espace utilisateur

- Authentification sécurisée (login/register)
- Gestion des sessions via cookies HttpOnly
- Création d’entrées de travail :
  - plusieurs créneaux pour une même journée
  - heure de début
  - heure de fin
  - taux horaire
  - description facultative
- Duplication rapide d’un créneau en changeant uniquement sa date
- Enregistrement groupé et atomique des créneaux d’une journée
- Calcul automatique :
  - durée travaillée
  - revenu généré
- Historique complet des entrées
- Statistiques mensuelles :
  - total heures
  - total revenus
- Suppression d’entrées
- Modification du mot de passe

---

### 🛠️ Espace administrateur

- Liste complète des utilisateurs
- Suppression de comptes
- Promotion / rétrogradation admin
- Accès aux statistiques globales
- Gestion sécurisée des privilèges

---

## 🔐 Sécurité avancée

### 🔒 Authentification

- JWT sécurisé
- Stockage via cookies HttpOnly
- Aucun stockage sensible côté frontend

---

### 🛡️ Protection backend

- Validation stricte des inputs
- Protection brute-force basique
- Middleware d’authentification sécurisé

---

### 🌐 Sécurité frontend

- CSP (Content Security Policy) stricte
- Aucune injection HTML dynamique
- Pas de `innerHTML` dangereux

---

### 🔐 Headers HTTP

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`

---

## 🧱 Stack technique

### Frontend

- HTML5
- CSS3 (design SaaS custom)
- JavaScript Vanilla
- Interface responsive pensée comme une application mobile
- Navigation tactile fixe en bas sur téléphone
- Respect des zones sûres et modales adaptées aux petits écrans

---

### Backend

- Node.js 18+
- Express.js
- SQLite (léger & rapide)
- Middleware custom

---

## 🧠 Architecture

### Backend

- `server.js` → point d’entrée principal
- `database.js` → gestion SQLite
- `routes/` → logique API :
  - `auth.js`
  - `entries.js`
  - `admin.js`
- `middleware/auth.js` → sécurisation des routes

---

### Frontend

- `public/index.html` → UI principale
- `public/js/app11.js` → logique client
- `public/css/style8.css` → UI design

---

## 📁 Structure du projet

```bash
.
├── public/
│   ├── css/style8.css
│   ├── js/app11.js
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
├── .env.example
└── README.md
```

---

## ⚙️ Installation complète

### 1. Cloner le repo

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

JWT_SECRET=UNE_CLE_LONGUE_DE_32+_CARACTERES

ALLOW_ADMIN_BOOTSTRAP=false
ADMIN_BOOTSTRAP_TOKEN=

ADMIN_USER=
ADMIN_EMAIL=
ADMIN_PASS=
```

---

### 3. Lancement

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

## 🌐 API (Backend)

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`

### Entrées

* `GET /api/entries`
* `POST /api/entries`
* `POST /api/entries/bulk` — ajouter plusieurs créneaux pour une même date
* `POST /api/entries/:id/duplicate` — dupliquer un créneau à une autre date
* `PUT /api/entries/:id`
* `DELETE /api/entries/:id`

### Admin

* `GET /api/admin/users`
* `POST /api/admin/promote`
* `DELETE /api/admin/user/:id`

---

## 📱 UI / UX

* 📱 Expérience proche d’une application mobile
* 🧭 Navigation inférieure fixe et adaptée au tactile
* 🗓️ Saisie de plusieurs créneaux sur une même journée
* 📋 Duplication rapide avec changement de date
* 🌙 Dark mode moderne
* ⚡ Expérience fluide
* 🎨 Design SaaS premium
* 💎 Animations légères

---

## 🧪 Debug

### Serveur

```bash
npm start
```

### Vérifications

* `.env` correct
* `JWT_SECRET` valide
* port libre
* base SQLite accessible

---

## 🔒 Sécurité

### ❌ Ne jamais commit

```
.env
database.db
JWT_SECRET
```

### ✔️ Bonnes pratiques

* utiliser un secret fort
* protéger accès admin
* limiter accès serveur

---

## 📈 Roadmap

* Export CSV / PDF
* Dashboard avancé
* Authentification 2FA
* Multi-utilisateurs (teams)
* API publique
* Logs avancés

---

# 🇬🇧 Full Documentation

---

## 🚀 Overview

**Hour Calculator** is a modern SaaS web application designed to:

* track working hours
* automatically calculate earnings
* manage users securely

---

## ✨ Features

### 👤 User

* Secure authentication
* Work entries management
* Multiple work periods on the same day
* Batch creation for a full workday
* Quick entry duplication with a new date
* Automatic:

  * duration calculation
  * salary calculation
* Monthly statistics
* Entry deletion
* Password update
* Mobile app-like bottom navigation and touch-friendly interface

---

### 🛠️ Admin

* User management
* Role control (admin/user)
* Account deletion
* Global stats

---

## 🔐 Security

* HttpOnly cookies
* Secure JWT
* Server-side validation
* CSP protection
* No frontend injection

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
