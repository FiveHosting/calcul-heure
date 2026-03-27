# Calculateur d'Heures — version durcie

## Correctifs de sécurité appliqués
- dossier public isolé (`public/`) au lieu d'exposer tout le projet
- authentification par cookie `HttpOnly` au lieu de `localStorage`
- vérification stricte de `JWT_SECRET` au démarrage
- suppression de la création automatique d'admin par défaut
- route `/api/auth/create-admin` désactivée par défaut
- validation serveur renforcée sur utilisateurs et entrées
- limitation simple des tentatives sur les routes sensibles
- en-têtes HTTP de sécurité et CSP côté serveur
- rendu frontend sans injection de HTML utilisateur

## Installation
```bash
npm install
cp .env.example .env
# renseigne ensuite tes vraies valeurs dans .env
npm start
```

## Variables d'environnement requises
```env
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

## Créer un admin de façon sûre
Méthode recommandée :
```bash
ADMIN_USER=ton_admin ADMIN_EMAIL=admin@exemple.com ADMIN_PASS='motdepassefort123' node setup-admin.js
```

## Notes importantes
- ne déploie jamais `.env`, `.git`, `database.db` ou les scripts internes dans un dossier public
- en production, sers l'application derrière HTTPS
- garde `ALLOW_ADMIN_BOOTSTRAP=false` sauf besoin très temporaire
