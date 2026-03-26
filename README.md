# 📊 Calculateur d'Heures v2.0

**Application web complète de calcul de salaire avec authentification, base de données SQLite et déploiement VestaCP prêt.**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-green.svg)](https://heurejo.fivehosting.net)
[![Node.js](https://img.shields.io/badge/Node.js-18+-blue.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Vue d'ensemble

Calculateur d'Heures est une application web moderne qui permet de :
- ✅ **Saisir des heures de travail** avec taux horaires personnalisés
- ✅ **Calculer automatiquement** les salaires
- ✅ **Stocker les données** de manière sécurisée (SQLite)
- ✅ **Authentification complète** (inscription/connexion)
- ✅ **Interface responsive** (mobile + desktop)
- ✅ **Déploiement prêt** pour VestaCP/FiveHosting

**Technologies :** Node.js, Express, SQLite3, JWT, bcrypt, HTML5/CSS3/JavaScript

---

## 🚀 Installation rapide (5 minutes)

### Prérequis
- Node.js 18+ ([télécharger](https://nodejs.org/))
- npm

### Installation
```bash
# Cloner le repository
git clone https://github.com/votre_user/calcul-heure.git
cd calcul-heure

# Installer les dépendances
npm install

# Configurer l'environnement
nano .env
```

**Contenu du fichier `.env` :**
```env
PORT=3001
DB_PATH=./database.db
JWT_SECRET=votre_clé_secrète_très_sûre_ici_32_caractères_minimum
NODE_ENV=production
```

**Générer un JWT_SECRET fort :**
```bash
openssl rand -base64 32
# Copier le résultat dans .env
```

### Démarrage
```bash
# Démarrer l'application
npm start

# Ou en développement
npm run dev
```

**Accéder à l'app :** http://localhost:3001

---

## 📁 Structure du projet

```
calcul-heure/
├── index.html          # Interface utilisateur
├── server.js           # Serveur Express
├── database.js         # Configuration SQLite
├── middleware.js       # Authentification JWT
├── routes/
│   ├── auth.js         # API authentification
│   └── entries.js      # API entrées de travail
├── package.json        # Dépendances
├── .env               # Configuration
└── README.md          # Cette documentation
```

---

## 🔐 Authentification

### Inscription
- **Email** : requis, unique
- **Nom d'utilisateur** : requis, unique
- **Mot de passe** : minimum 6 caractères
- **Hashage** : bcrypt (sécurisé)

### Connexion
- **Token JWT** : valide 7 jours
- **Stockage** : localStorage du navigateur
- **Protection** : toutes les routes API

### Sécurité
- ✅ Mots de passe hashés (bcrypt)
- ✅ Tokens JWT signés
- ✅ Protection CSRF
- ✅ Headers de sécurité

---

## 💾 Base de données

### Structure SQLite
```sql
-- Utilisateurs
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entrées de travail
CREATE TABLE work_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    description TEXT,
    hours DECIMAL(4,2) NOT NULL,
    minutes INTEGER NOT NULL,
    total_hours DECIMAL(5,2) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Fonctionnalités
- ✅ Création automatique au premier démarrage
- ✅ Calcul automatique des heures et salaires
- ✅ Historique complet par utilisateur
- ✅ Filtrage par mois

---

## 🌐 API REST

### Authentification
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "confirmPassword": "securepass123"
}
```

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123"
}
```

### Entrées de travail
```
GET /api/work/entries
Authorization: Bearer <token>
```

```
POST /api/work/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "17:30",
  "hourlyRate": 12.50,
  "description": "Service du matin"
}
```

```
DELETE /api/work/entries/:id
Authorization: Bearer <token>
```

---

## 🎨 Interface utilisateur

### Fonctionnalités
- ✅ **Design moderne** : gradient, cartes, animations
- ✅ **Responsive** : mobile, tablette, desktop
- ✅ **Authentification** : onglets connexion/inscription
- ✅ **Dashboard** : statistiques mensuelles
- ✅ **Formulaire** : saisie intuitive des heures
- ✅ **Historique** : liste triée par date
- ✅ **Calculs** : heures, salaire automatique

### Navigation
1. **Page d'accueil** : connexion/inscription
2. **Dashboard** : vue d'ensemble + statistiques
3. **Ajout d'entrée** : formulaire de saisie
4. **Historique** : consultation des données

---

## 🚀 Déploiement VestaCP (FiveHosting)

### Prérequis serveur
- ✅ VestaCP installé
- ✅ Node.js 18+ disponible
- ✅ PM2 installé globalement
- ✅ Nginx configuré
- ✅ SSL Let's Encrypt activé

### Étapes de déploiement (30 minutes)

#### 1. SSH + Téléchargement (5 min)
```bash
# Connexion SSH
ssh admin@185.171.202.132

# Créer dossier application
mkdir -p /home/admin/web/heurejo.fivehosting.net/calcul-heure
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Télécharger le code
git clone https://github.com/votre_user/calcul-heure .

# Installer dépendances
npm install
```

#### 2. Configuration (2 min)
```bash
# Éditer .env
nano .env

# Contenu :
PORT=3001
DB_PATH=./database.db
JWT_SECRET=[votre_clé_sécurisée]
NODE_ENV=production
```

#### 3. PM2 Setup (2 min)
```bash
# Installer PM2
npm install -g pm2

# Créer ecosystem.config.js
nano ecosystem.config.js
```

**Contenu ecosystem.config.js :**
```javascript
module.exports = {
  apps: [
    {
      name: 'calcul-heure',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      ignore_watch: ['node_modules', 'database.db', '.env', 'logs'],
      max_memory_restart: '500M',
      restart_delay: 4000,
      autorestart: true
    }
  ]
};
```

```bash
# Démarrer l'application
pm2 start ecosystem.config.js
pm2 status  # Doit afficher "online"
```

#### 4. Configuration Nginx (5 min)

**Modifier la config VestaCP :**
```bash
sudo nano /home/admin/conf/web/nginx.heurejo.fivehosting.net.conf
```

**Remplacer le contenu par :**
```nginx
server {
    listen      185.171.202.132:80;
    server_name heurejo.fivehosting.net www.heurejo.fivehosting.net;
    error_log  /var/log/apache2/domains/heurejo.fivehosting.net.error.log error;

    # Redirection HTTP → HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }

    # Pour Let's Encrypt (certbot renewal)
    location /.well-known/acme-challenge/ {
        root /home/admin/web/heurejo.fivehosting.net/public_html;
    }

    location /error/ {
        alias   /home/admin/web/heurejo.fivehosting.net/document_errors/;
    }

    location ~ /\.ht    {return 404;}
    location ~ /\.env   {return 404;}
    location ~ /\.svn/  {return 404;}
    location ~ /\.git/  {return 404;}
    location ~ /\.hg/   {return 404;}
    location ~ /\.bzr/  {return 404;}

    disable_symlinks if_not_owner from=/home/admin/web/heurejo.fivehosting.net/public_html;

    include /home/admin/conf/web/nginx.heurejo.fivehosting.net.conf*;
}

# Configuration HTTPS pour Node.js
server {
    listen      185.171.202.132:443 ssl http2;
    server_name heurejo.fivehosting.net www.heurejo.fivehosting.net;
    error_log  /var/log/apache2/domains/heurejo.fivehosting.net.error.log error;
    access_log /var/log/apache2/domains/heurejo.fivehosting.net.log combined;

    # Certificats SSL VestaCP
    ssl_certificate /home/admin/conf/web/ssl.heurejo.fivehosting.net.pem;
    ssl_certificate_key /home/admin/conf/web/ssl.heurejo.fivehosting.net.key;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy vers Node.js (PORT 3001)
    location / {
        proxy_pass http://127.0.0.1:3001;

        # Headers pour Node.js
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Fichiers statiques (cache 30 jours)
    location ~* ^.+\.(jpeg|jpg|png|gif|bmp|ico|svg|tif|tiff|css|js|ttf|otf|webp|txt|csv|rtf|doc|docx|xls|xlsx|ppt|pptx|odf|odp|ods|odt|pdf|psd|ai|eot|eps|ps|zip|tar|tgz|gz|rar|bz2|7z|aac|m4a|mp3|mp4|og)$ {
        root           /home/admin/web/heurejo.fivehosting.net/public_html;
        access_log     /var/log/apache2/domains/heurejo.fivehosting.net.log combined;
        access_log     /var/log/apache2/domains/heurejo.fivehosting.net.bytes bytes;
        expires        30d;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location /error/ {
        alias   /home/admin/web/heurejo.fivehosting.net/document_errors/;
    }

    # Sécurité - Bloquer fichiers sensibles
    location ~ /\.ht    {return 404;}
    location ~ /\.env   {return 404;}
    location ~ /\.svn/  {return 404;}
    location ~ /\.git/  {return 404;}
    location ~ /\.hg/   {return 404;}
    location ~ /\.bzr/  {return 404;}

    disable_symlinks if_not_owner from=/home/admin/web/heurejo.fivehosting.net/public_html;

    include /home/admin/conf/web/nginx.heurejo.fivehosting.net.conf*;
}
```

#### 5. Test final (3 min)
```bash
# Tester la config Nginx
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Vérifier les ports
sudo netstat -tlnp | grep 3001  # Node.js
sudo netstat -tlnp | grep :443   # Nginx HTTPS

# Tester l'application
curl https://heurejo.fivehosting.net
```

### SSL Let's Encrypt (via VestaCP)
1. Aller sur https://votre_ip:8083
2. Se connecter avec admin
3. Domaines → heurejo.fivehosting.net
4. SSL → Activer Let's Encrypt
5. Attendre 5 minutes

---

## 🔧 Maintenance

### Démarrage/Arrêt
```bash
# État
pm2 status

# Redémarrer
pm2 restart calcul-heure

# Arrêter
pm2 stop calcul-heure

# Logs
pm2 logs calcul-heure
```

### Sauvegarde base de données
```bash
# Backup manuel
cp /home/admin/web/heurejo.fivehosting.net/calcul-heure/database.db \
   /home/admin/web/heurejo.fivehosting.net/calcul-heure/backups/database_$(date +%Y%m%d).db

# Backup automatique (cron)
crontab -e
# Ajouter: 0 2 * * * cp /path/to/database.db /path/to/backups/database_$(date +\%Y\%m\%d).db
```

### Mise à jour
```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure
git pull
npm install
pm2 restart calcul-heure
```

### Monitoring
```bash
# Ressources système
htop
df -h
free -h

# Logs Nginx
sudo tail -f /var/log/nginx/error.log

# Logs application
pm2 logs calcul-heure --lines 100
```

---

## 🆘 Dépannage

### "502 Bad Gateway"
```bash
# Vérifier Node.js
pm2 status
pm2 logs calcul-heure

# Redémarrer
pm2 restart calcul-heure
```

### "Port 3001 already in use"
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
pm2 restart calcul-heure
```

### "Cannot find module"
```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure
npm install
pm2 restart calcul-heure
```

### "SSL ne fonctionne pas"
```bash
# Vérifier certificats
ls -la /home/admin/conf/web/ssl.heurejo.fivehosting.net.*

# Recharger Nginx
sudo systemctl reload nginx
```

### "Base de données corrompue"
```bash
# Restaurer backup
cp backups/database_YYYYMMDD.db database.db
pm2 restart calcul-heure
```

---

## 📊 Scripts utiles

### Script de déploiement automatique
```bash
#!/bin/bash
# deploy.sh - Déploiement automatique

set -e

echo "🚀 Déploiement Calculateur d'Heures"

# Vérifier root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Exécuter en root"
  exit 1
fi

APP_DIR="/home/admin/web/heurejo.fivehosting.net/calcul-heure"

# Créer dossier
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Télécharger code
if [ ! -d ".git" ]; then
  git clone https://github.com/votre_user/calcul-heure .
fi

# Installer dépendances
npm install

# Config .env si absent
if [ ! -f ".env" ]; then
  cat > .env << EOF
PORT=3001
DB_PATH=./database.db
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
fi

# PM2
npm install -g pm2

# Config PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'calcul-heure',
    script: './server.js',
    instances: 1,
    env: { PORT: 3001, NODE_ENV: 'production' },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    max_memory_restart: '500M',
    autorestart: true
  }]
};
EOF

# Démarrer
pm2 stop calcul-heure 2>/dev/null || true
pm2 start ecosystem.config.js

echo "✅ Déploiement terminé!"
echo "🌐 https://heurejo.fivehosting.net"
```

### Script de backup
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/home/admin/web/heurejo.fivehosting.net/calcul-heure/backups"
mkdir -p "$BACKUP_DIR"

DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/home/admin/web/heurejo.fivehosting.net/calcul-heure/database.db"

cp "$DB_FILE" "$BACKUP_DIR/database_$DATE.db"
echo "💾 Backup créé: $BACKUP_DIR/database_$DATE.db"
```

---

## 📈 Fonctionnalités futures

- [ ] Export PDF des bulletins de salaire
- [ ] Graphiques statistiques avancés
- [ ] Notifications email
- [ ] API mobile
- [ ] Multi-utilisateurs (admin)
- [ ] Sauvegarde cloud
- [ ] Thèmes personnalisables

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonction`)
3. Commit (`git commit -am 'Ajout nouvelle fonction'`)
4. Push (`git push origin feature/nouvelle-fonction`)
5. Créer une Pull Request

---

## 📄 Licence

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

- **Email** : votre_email@example.com
- **GitHub Issues** : [Signaler un bug](https://github.com/votre_user/calcul-heure/issues)
- **Documentation** : Ce README contient tout

---

## 🎉 Remerciements

- Node.js et Express pour le backend
- SQLite3 pour la base de données
- JWT et bcrypt pour la sécurité
- VestaCP pour l'hébergement

---

**🚀 Prêt pour la production !**

**Déployé sur :** https://heurejo.fivehosting.net

**Version :** 2.0.0  
**Date :** Mars 2026  
**Status :** ✅ Production Ready
