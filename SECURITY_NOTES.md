# Résumé des patchs appliqués

## Critique
- `server.js` ne sert plus tout le dossier projet. Seul `public/` est exposé.
- suppression des secrets et identifiants par défaut dans le code
- `JWT_SECRET` obligatoire et longueur minimale imposée
- création auto d'admin supprimée
- `.env` et `.git` retirés de l'archive corrigée

## Élevé
- authentification déplacée vers un cookie `HttpOnly` `SameSite=Strict`
- rendu frontend modifié pour éviter l'injection de HTML utilisateur
- route admin bootstrap désactivée par défaut (`ALLOW_ADMIN_BOOTSTRAP=false`)

## Moyen
- validation serveur renforcée
- rate limiting sur login/register/change-password/create-admin
- en-têtes HTTP de sécurité + CSP

## À faire avant prod
- passer le site derrière HTTPS
- générer un vrai `JWT_SECRET`
- créer l'admin avec `setup-admin.js`
- installer les dépendances avec `npm install`
