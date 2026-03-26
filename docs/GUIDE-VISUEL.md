# 📱 Guide visuel d'utilisation

## Écran 1: Inscription

```
┌─────────────────────────────────┐
│  📊 Calculateur d'Heures       │
│                                 │
│  ┌─ Connexion | Inscription ──┐ │
│  │                             │ │
│  │ Nom d'utilisateur: [____]   │ │
│  │ Email: [____]               │ │
│  │ Mot de passe: [____]        │ │
│  │ Confirmer: [____]           │ │
│  │                             │ │
│  │ [  Créer un compte  ]       │ │
│  │                             │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Écran 2: Connexion

```
┌─────────────────────────────────┐
│  📊 Calculateur d'Heures       │
│                                 │
│  ┌─ Connexion | Inscription ──┐ │
│  │                             │ │
│  │ Nom d'utilisateur: [____]   │ │
│  │ Mot de passe: [____]        │ │
│  │                             │ │
│  │ [  Se connecter  ]          │ │
│  │                             │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Écran 3: Tableau de Bord (après connexion)

```
┌──────────────────────────────────────────────────────────┐
│  👤 Bienvenue elisa!               [Déconnexion]         │
│                                                           │
│         📊 Calculateur d'Heures                           │
│                                                           │
│  ┌─ Nouvelle entrée ──────┐  ┌─ Résumé mensuel ───────┐  │
│  │                        │  │                        │  │
│  │ Date: [2026-03-26]     │  │ Mois: [2026-03-]       │  │
│  │ Début: [09:00]         │  │                        │  │
│  │ Fin: [17:00]           │  │  Heures: 168h30        │  │
│  │ Taux: [12.50] €/h      │  │  Salaire: 2050,00 €    │  │
│  │ Description: [____]    │  │                        │  │
│  │                        │  │                        │  │
│  │ [➕ Ajouter]          │  │                        │  │
│  │                        │  │                        │  │
│  └────────────────────────┘  └────────────────────────┘  │
│                                                           │
│  📋 Historique des entrées                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Jeudi 26/03 - 09:00 à 17:00                          │ │
│  │ Travail • 8h00 • 12,50€/h               100,00 €    │ │
│  │                                [🗑️ Supprimer]       │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ Mercredi 25/03 - 09:00 à 17:00                       │ │
│  │ Travail • 8h00 • 12,50€/h               100,00 €    │ │
│  │                                [🗑️ Supprimer]       │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Flux de données

```
Frontend (index.html)
      ↓
      ├─→ POST /api/auth/register → database
      ├─→ POST /api/auth/login    → database
      │
      ├─→ POST /api/work/entries    → database
      ├─→ GET  /api/work/entries    ← database
      ├─→ PUT  /api/work/entries/:id → database
      └─→ DELETE /api/work/entries/:id → database

Backend (Express)
      ↓
  Middleware (JWT)
      ↓
  Routes (auth, entries)
      ↓
  Database (SQLite)
```

## Cycle de vie d'une session

```
1. Utilisateur visite la page
   ↓
2. Affichage écran Connexion/Inscription
   ↓
3. Utilisateur crée un compte OU se connecte
   ↓
4. Token JWT stocké en localStorage
   ↓
5. Affichage du tableau de bord
   ↓
6. Utilisateur ajoute des entrées
   ↓
7. Chaque entrée sauvegardée en BDD
   ↓
8. Consultation des statistiques mensuelles
   ↓
9. Déconnexion = suppression du token
   ↓
10. Retour à l'écran Connexion
```

## Types de requêtes API

### Authentification
```javascript
// INSCRIPTION
POST /api/auth/register
{
  "username": "elisa",
  "email": "elisa@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

// RÉPONSE
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "elisa",
    "email": "elisa@example.com"
  }
}
```

### Ajouter une heure
```javascript
POST /api/work/entries
Header: Authorization: Bearer <token>
{
  "date": "2026-03-26",
  "startTime": "09:00",
  "endTime": "17:00",
  "hourlyRate": 12.50,
  "description": "Travail normal"
}

// RÉPONSE
{
  "entry": {
    "id": 1,
    "date": "2026-03-26",
    "hours": 8,
    "minutes": 0,
    "totalHours": 8,
    "salary": 100.00
  }
}
```

### Récupérer les entrées
```javascript
GET /api/work/entries
Header: Authorization: Bearer <token>

// RÉPONSE
[
  {
    "id": 1,
    "date": "2026-03-26",
    "startTime": "09:00",
    "endTime": "17:00",
    "hourlyRate": 12.50,
    "hours": 8,
    "minutes": 0,
    "totalHours": 8,
    "salary": 100.00
  },
  ...
]
```

## Storage Local (localStorage)

```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "currentUser": {
    "id": 1,
    "username": "elisa",
    "email": "elisa@example.com"
  }
}
```

## Base de données - Exemple de données

```
TABLE users
┌──┬─────────┬──────────────────────┬──────────────────────┐
│id│username │email                 │password (hashé)      │
├──┼─────────┼──────────────────────┼──────────────────────┤
│1 │elisa    │elisa@example.com     │$2b$10$KSv3...       │
└──┴─────────┴──────────────────────┴──────────────────────┘

TABLE work_entries
┌──┬────────┬────────────┬──────────┬──────────┬─────────┐
│id│user_id │date        │start_time│end_time  │salary   │
├──┼────────┼────────────┼──────────┼──────────┼─────────┤
│1 │1       │2026-03-26  │09:00     │17:00     │100.00   │
│2 │1       │2026-03-25  │09:00     │17:00     │100.00   │
└──┴────────┴────────────┴──────────┴──────────┴─────────┘
```

## Raccourcis clavier (possibles ajouts futurs)

- `Ctrl+N` - Nouvelle entrée
- `Ctrl+S` - Sauvegarder
- `Ctrl+Q` - Quitter/Déconnecter

---

**Application prête à l'emploi avec interface complète!** 🎉
