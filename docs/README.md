# 📊 Calculateur d'Heures de Travail v2.0

Application complète avec authentification utilisateur et base de données pour gérer et calculer vos heures de travail.

## ✨ Nouvelles fonctionnalités v2.0

- ✅ **Authentification utilisateur** - Créez un compte et connectez-vous
- ✅ **Base de données** - Toutes vos heures sont sauvegardées de manière sécurisée
- ✅ **Persistance des données** - Vos données restent disponibles même après fermeture
- ✅ **API REST** - Backend Node.js + Express
- ✅ **Token JWT** - Authentification sécurisée
- ✅ **Criffrage de mots de passe** - Sécurité renforcée avec bcrypt

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- npm

### Étapes d'installation

1. **Cloner/Naviguer dans le projet**
```bash
cd c:\Users\elisa\Documents\GitHub\calcul-heure
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
Le fichier `.env` est déjà préconfiguré. Vous pouvez le modifier si nécessaire:
```
PORT=3000
DB_PATH=./database.db
JWT_SECRET=votre_clé_secrète_très_sûre_à_changer_en_production
NODE_ENV=development
```

4. **Démarrer le serveur**
```bash
npm start
```

ou en mode développement avec rechargement automatique:
```bash
npm run dev
```

5. **Accéder à l'application**
Ouvrez votre navigateur et allez sur: `http://localhost:3000`

## 📋 Utilisation

### Première visite
1. Cliquez sur **Inscription**
2. Remplissez le formulaire avec:
   - Nom d'utilisateur unique
   - Email valide
   - Mot de passe (minimum 6 caractères)
3. Cliquez sur "Créer un compte"

### Connexion
1. Entrez votre nom d'utilisateur et mot de passe
2. Cliquez sur "Se connecter"
3. Vous êtes maintenant connecté et vos données sont synchronisées

### Ajouter une journée de travail
1. Remplissez le formulaire "Nouvelle entrée":
   - **Date**: Sélectionnez la date
   - **Heure de début**: Heure d'arrivée
   - **Heure de fin**: Heure de départ
   - **Taux horaire**: Votre salaire horaire en euros
   - **Description**: Optionnel (ex: Service de nuit)
2. Cliquez sur "➕ Ajouter l'entrée"
3. L'entrée est automatiquement sauvegardée en base de données

### Consulter vos heures
- Sélectionnez le mois dans "Résumé mensuel"
- Les statistiques et la liste des entrées se mettent à jour automatiquement
- Consultez vos heures totales et votre salaire du mois

### Supprimer une entrée
- Cliquez sur le bouton "🗑️ Supprimer" à côté de l'entrée
- Confirmez la suppression

## 🗄️ Structure de la base de données

### Table `users`
- `id`: Identifiant unique
- `username`: Nom d'utilisateur unique
- `email`: Email unique
- `password`: Mot de passe hashé (bcrypt)
- `created_at`: Date de création

### Table `work_entries`
- `id`: Identifiant unique
- `user_id`: Référence à l'utilisateur
- `date`: Date du travail
- `start_time`: Heure de début
- `end_time`: Heure de fin
- `hourly_rate`: Taux horaire en euros
- `description`: Description optionnelle
- `hours`: Heures travaillées (nombre entier)
- `minutes`: Minutes restantes
- `total_hours`: Heures totales (décimal)
- `salary`: Salaire calculé
- `created_at`: Date de création

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

### Heures de travail
- `GET /api/work/entries` - Récupérer toutes les entrées
- `GET /api/work/entries/:month` - Récupérer les entrées d'un mois (format: YYYY-MM)
- `POST /api/work/entries` - Ajouter une entrée
- `PUT /api/work/entries/:id` - Modifier une entrée
- `DELETE /api/work/entries/:id` - Supprimer une entrée

## 🔒 Sécurité

- Tous les mots de passe sont hashés avec bcrypt
- Authentification par JWT (JSON Web Tokens)
- Les tokens ont une durée de validité de 7 jours
- Le champ JWT_SECRET doit être changé en production
- Utilisez HTTPS en production

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifiez que le port 3000 n'est pas occupé
# Vérifiez que Node.js est correctement installé
node --version
npm --version
```

### Erreur de base de données
```bash
# La base de données sera recréée au premier démarrage
# Si vous avez des problèmes, supprimez database.db et redémarrez
```

### Erreur CORS
Le CORS est configuré pour autoriser les requêtes locales. En production, configurez les domaines autorisés.

## 📦 Fichiers importants

- `server.js` - Point d'entrée du serveur
- `database.js` - Configuration SQLite
- `middleware.js` - Authentification JWT
- `routes/auth.js` - Routes d'authentification
- `routes/entries.js` - Routes des heures de travail
- `index.html` - Interface utilisateur
- `.env` - Variables d'environnement

## 💾 Backup et export

Les données sont sauvegardées automatiquement dans la base de données SQLite. 
Vous pouvez exporter vos données en téléchargeant le fichier `database.db`.

---

# 🚀 DÉPLOIEMENT SUR VPS avec VestaCP

## 📋 Prérequis sur le serveur

Vous devez avoir sur votre VPS:
- ✅ Accès SSH
- ✅ VestaCP installé
- ✅ Node.js disponible
- ✅ Un domaine pointant vers votre serveur

## 🔧 Étape 1: Préparer le serveur

### Connexion SSH

```bash
# Se connecter au serveur
ssh root@votre_ip_serveur

# Ou avec un utilisateur spécifique
ssh utilisateur@votre_domaine.com
```

### Vérifier/Installer Node.js

```bash
# Vérifier si Node.js est installé
node --version
npm --version

# Si non installé, installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version  # doit afficher v18.x.x
npm --version   # doit afficher 9.x.x
```

### Installer PM2 (gestionnaire de processus)

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Vérifier installation
pm2 --version
```

## 📂 Étape 2: Créer un dossier pour l'application

```bash
# Créer le dossier de l'application
sudo mkdir -p /home/admin/calcul-heure
cd /home/calcul-heure

# (Remplacez 'admin' par votre utilisateur VestaCP)
```

## 📦 Étape 3: Télécharger/Uploader l'application

### Option A: Via Git (recommandé)

```bash
cd /home/admin/calcul-heure

# Cloner le repo (ou télécharger le zip)
git clone https://github.com/votre-repo/calcul-heure.git .

# Installer les dépendances
npm install
```

### Option B: Via SFTP

1. Ouvrir FileZilla ou WinSCP
2. Se connecter avec les identifiants SSH
3. Uploader tous les fichiers du projet dans `/home/admin/calcul-heure/`
4. Exécuter dans le terminal:
```bash
cd /home/admin/calcul-heure
npm install
```

## ⚙️ Étape 4: Configurer les variables d'environnement

```bash
# Éditer le fichier .env
nano .env
```

**Contenu du .env pour VestaCP:**
```env
PORT=3000
DB_PATH=/home/admin/calcul-heure/database.db
JWT_SECRET=votre_clé_très_secrète_et_très_longue_à_générer
NODE_ENV=production
```

**Générer une clé JWT sécurisée:**
```bash
openssl rand -base64 32
```

Copier le résultat dans `JWT_SECRET`

💾 Sauvegarder avec: `CTRL+X` puis `Y` puis `ENTRÉE`

## 🚀 Étape 5: Démarrer l'application avec PM2

```bash
# Se placer dans le dossier
cd /home/admin/calcul-heure

# Démarrer l'app avec PM2
pm2 start server.js --name "calcul-heure"

# Sauvegarder la configuration PM2
pm2 startup
pm2 save

# Vérifier que ça tourne
pm2 status
pm2 logs calcul-heure
```

## 🌐 Étape 6: Configurer Nginx (VestaCP)

VestaCP utilise Nginx par défaut. Il faut créer un reverse proxy.

### Créer un fichier de configuration Nginx

```bash
# Créer le config
sudo nano /etc/nginx/sites-available/calcul-heure
```

**Contenu:**
```nginx
upstream calcul_heure_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name votre_domaine.com www.votre_domaine.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name votre_domaine.com www.votre_domaine.com;

    # Certificats SSL (Let's Encrypt via VestaCP)
    ssl_certificate /home/admin/conf/web/ssl.calcul-heure.com.crt;
    ssl_certificate_key /home/admin/conf/web/ssl.calcul-heure.com.key;

    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Reverse proxy
    location / {
        proxy_pass http://calcul_heure_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Limiter la taille des uploads
    client_max_body_size 10M;

    # Logs
    access_log /home/admin/logs/calcul-heure.access.log;
    error_log /home/admin/logs/calcul-heure.error.log;
}
```

⚠️ **Remplacer:**
- `calcul-heure.com` par votre domaine
- `/home/admin/` par votre chemin utilisateur

### Activer la configuration

```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/calcul-heure /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 🔐 Étape 7: Activation SSL/HTTPS

### Via VestaCP Web UI:

1. Connectez-vous à VestaCP (~:8083)
2. Allez dans `Web` → `Domains`
3. Sélectionnez votre domaine
4. Cliquez sur l'icône SSL
5. Cliquez `Auto` (Let's Encrypt gratuit)

### Via Terminal:

```bash
# Installer certbot si pas installé
sudo apt-get install -y certbot python3-certbot-nginx

# Générer le certificat
sudo certbot certonly --nginx -d votre_domaine.com -d www.votre_domaine.com

# Renouvellement automatique
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 📁 Structure des fichiers sur VPS

```
/home/admin/calcul-heure/
├── server.js
├── database.js
├── middleware.js
├── package.json
├── .env                    ← Sécurisé (ne pas partager)
├── index.html
├── database.db             ← Données (BACKUP régulièrement)
├── routes/
│   ├── auth.js
│   └── entries.js
└── node_modules/           ← Créé automatiquement
```

## 🔄 Gestion avec PM2

```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs calcul-heure

# Redémarrer l'app
pm2 restart calcul-heure

# Arrêter l'app
pm2 stop calcul-heure

# Supprimer l'app
pm2 delete calcul-heure
```

## 📊 Monitoring et Logs

```bash
# Logs en temps réel
pm2 logs calcul-heure

# Logs Nginx
tail -f /home/admin/logs/calcul-heure.access.log
tail -f /home/admin/logs/calcul-heure.error.log

# Monitor système
pm2 monit
```

## 🛡️ Sécurité sur le VPS

### 1. Firewall

```bash
# Ouvrir les ports nécessaires
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Permissions des fichiers

```bash
# Sécuriser les permissions
cd /home/admin/calcul-heure
chmod 755 .              # Dossier
chmod 644 *.js           # Fichiers JS
chmod 600 .env           # Fichier .env (sensible)
chmod 644 database.db    # Base de données
```

### 3. Backup de la base de données

```bash
# Script de backup automatique
sudo nano /home/admin/backup-calcul-heure.sh
```

**Contenu:**
```bash
#!/bin/bash
BACKUP_DIR="/home/admin/backups"
mkdir -p $BACKUP_DIR
cp /home/admin/calcul-heure/database.db $BACKUP_DIR/database-$(date +%Y%m%d-%H%M%S).db
# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "database-*.db" -mtime +7 -delete
```

Rendre exécutable:
```bash
chmod +x /home/admin/backup-calcul-heure.sh
```

Ajouter au cron (todos les jours à 02:00):
```bash
crontab -e
# Ajouter cette ligne:
0 2 * * * /home/admin/backup-calcul-heure.sh
```

## 🚨 Troubleshooting VestaCP

### Le site affiche une erreur "Bad Gateway"

```bash
# Vérifier que Node.js tourne
pm2 status

# Vérifier les logs
pm2 logs calcul-heure

# Redémarrer
pm2 restart calcul-heure
```

### Erreur "Connection refused"

```bash
# Vérifier que le port 3000 est en écoute
netstat -tlnp | grep 3000

# Vérifier Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Base de données corrompue

```bash
cd /home/admin/calcul-heure
rm database.db          # Supprimer la DB
pm2 restart calcul-heure # Redémarrer (elle sera recréée)
```

## 📝 Mise à jour de l'application

```bash
cd /home/admin/calcul-heure

# Télécharger les nouvelles versions
git pull origin main
# OU uploader les fichiers manuellement

# Installer les nouvelles dépendances
npm install

# Redémarrer
pm2 restart calcul-heure
```

## 💡 Tips & Tricks

### Augmenter les limites

```bash
# Dans /etc/security/limits.conf ajouter:
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
```

### Compression Gzip

Nginx l'active automatiquement.

### Cache

Ajouter au reverse proxy dans Nginx:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
proxy_cache my_cache;
proxy_cache_valid 200 1h;
```

## 📞 Support VestaCP

Documentation: https://vestacp.com/
Forum: https://forum.vestacp.com/

---

## 📝 Licence

Ce projet est libre d'utilisation à titre personnel.

## 🆘 Support

Pour toute question ou problème, consultez les logs du serveur:
```bash
# Local
npm run dev

# VPS
pm2 logs calcul-heure
```

---

**Version**: 2.0.0  
**Dernière mise à jour**: Mars 2026
