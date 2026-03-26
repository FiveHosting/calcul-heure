# 🚀 Guide d'installation FiveHosting + Node.js

**Domaine**: heurejo.fivehosting.net  
**Chemin**: `/public_html/`  
**Port**: 3001  
**Statut**: Migration depuis HTML statique → Node.js v2.0  

---

## ⏱️ Temps total: 45-60 minutes

```
1. Préparation (5 min)
2. Connexion SSH (1 min)
3. Télécharger l'application (5 min)
4. Installer Node.js (10 min)
5. Installer PM2 (5 min)
6. Configuration .env (5 min)
7. Démarrer l'application (5 min)
8. Configurer Nginx (5 min)
9. Tester en HTTPS (5 min)
```

---

## 📋 Prérequis

- ✅ Accès SSH à FiveHosting (login + mot de passe)
- ✅ Node.js installé ou possibilité de l'installer
- ✅ Port 3001 disponible
- ✅ HTTPS activé (Let's Encrypt gratuit chez FiveHosting)
- ✅ Terminal SSH (PuTTY, Termius, ou intégré)

---

## Étape 1: Connexion SSH

### Récupérer vos données de connexion FiveHosting

1. Allez sur [https://fivehosting.net](https://fivehosting.net)
2. Connectez-vous à votre compte
3. Client → Mes domaines → heurejo.fivehosting.net
4. Onglet **Accès SSH**
5. Copiez:
   - **Serveur SSH**: ex: `ssh-heurejo.fivehosting.net`
   - **Port SSH**: ex: `22`
   - **Utilisateur**: ex: `heurejo`
   - **Mot de passe**: (celui que vous avez)

### Connexion

```bash
# Sur Windows (PowerShell)
ssh heurejo@ssh-heurejo.fivehosting.net -p 22

# Entrez votre mot de passe FiveHosting
```

```bash
# Sur Mac/Linux
ssh heurejo@ssh-heurejo.fivehosting.net
```

### Vérifier la connexion

```bash
pwd
# Résultat: /home/heurejo (ou similaire)

ls -la
# Vous devez voir: public_html
```

---

## Étape 2: Afficher la structure FiveHosting

```bash
# Voir où vous êtes
pwd

# Voir les fichiers
ls -la

# Typiquement:
# /home/heurejo/public_html/  ← Vos fichiers web publics
```

---

## Étape 3: Sauvegarder les anciens fichiers

```bash
# Sauvegarde de l'ancien site HTML
cd ~/public_html
mkdir old_backup_$(date +%Y%m%d)
mv * old_backup_$(date +%Y%m%d)/ 2>/dev/null || true

# Vérifier
ls -la
```

---

## Étape 4: Créer la structure pour Node.js

```bash
# Créer un dossier pour l'app Node.js
cd ~
mkdir -p app/calcul-heure
cd app/calcul-heure

# Vérifier
pwd
# Résultat: /home/heurejo/app/calcul-heure (ou équivalent)
```

---

## Étape 5: Télécharger l'application

### Option A: Via Git (si disponible)

```bash
cd ~/app/calcul-heure

# Cloner le repository
git clone https://github.com/votre_user/calcul-heure .

# Vérifier
ls -la
# Vous devez voir: package.json, server.js, database.js, etc.
```

### Option B: Via SCP (depuis votre PC)

```bash
# Sur votre PC (PowerShell), dans le dossier du projet
scp -r -P 22 ./* heurejo@ssh-heurejo.fivehosting.net:~/app/calcul-heure/

# Sur Windows, si scp ne fonctionne pas, utiliser WinSCP:
# 1. Télécharger WinSCP
# 2. Connexion: ssh-heurejo.fivehosting.net
# 3. Drag-drop les fichiers dans ~/app/calcul-heure/
```

### Option C: Manuellement (plus long)

```bash
# Sur le serveur
mkdir -p ~/app/calcul-heure
cd ~/app/calcul-heure

# Utiliser nano pour créer les fichiers un par un
# (Non recommandé pour les gros projets)
```

---

## Étape 6: Vérifier Node.js

```bash
# Vérifier Node.js
node --version
npm --version

# Résultat attendu:
# v18.x.x ou supérieur
# 9.x.x ou supérieur
```

### Si Node.js n'est pas installé

Contactez le support FiveHosting ou essayez:

```bash
# Installer nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recharger le profil
source ~/.bashrc

# Installer Node.js 18
nvm install 18
nvm use 18

# Vérifier
node --version
```

---

## Étape 7: Installer les dépendances

```bash
cd ~/app/calcul-heure

# Installer npm
npm install

# Résultat attendu:
# added XXX packages
```

### En cas d'erreur

```bash
# Nettoyer et réessayer
rm -rf node_modules package-lock.json
npm install --prefer-offline

# Ou installer spécifiques
npm install express sqlite3 jsonwebtoken bcrypt dotenv cors
```

---

## Étape 8: Configurer .env

```bash
cd ~/app/calcul-heure

# Éditer le fichier .env
nano .env
```

**Contenu de .env:**

```
PORT=3001
DB_PATH=./database.db
JWT_SECRET=générer_une_clé_très_sûre_ici_32_caractères_minimum
NODE_ENV=production
```

### Générer un JWT_SECRET fort

```bash
openssl rand -base64 32
```

**Exemple de résultat:**
```
wK8hJ2nL9pQ5rT6vX8yZ1aB3cD4eF6gH7iJ9kL0mN2oP4qR6sT8uV0w
```

**Copier ce résultat dans .env**

**Pour sauvegarder dans nano:**
- Ctrl+O (écrire)
- Entrée (confirmer)
- Ctrl+X (quitter)

---

## Étape 9: Tester localement (optionnel)

```bash
cd ~/app/calcul-heure

# Démarrer l'app
npm start

# Résultat attendu:
# Server running on port 3001
# Database initialized

# Accéder (sur votre PC)
# Mal possible car c'est l'intérieur du serveur
# Pour tester: curl http://localhost:3001 (sur le serveur)

# Arrêter: Ctrl+C
```

---

## Étape 10: Installer PM2 (gestionnaire de processus)

```bash
# Installation globale
npm install -g pm2

# Vérifier
pm2 --version
# Résultat: 5.x.x
```

---

## Étape 11: Configurer PM2

```bash
cd ~/app/calcul-heure

# Créer un fichier ecosystem.config.js
nano ecosystem.config.js
```

**Contenu du fichier:**

```javascript
module.exports = {
  apps: [
    {
      name: 'calcul-heure',
      script: './server.js',
      instances: 1,
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      ignore_watch: ['node_modules', 'database.db', '.env'],
      max_memory_restart: '500M',
      restart_delay: 4000,
      autorestart: true
    }
  ]
};
```

**Pour sauvegarder:**
- Ctrl+O, Entrée, Ctrl+X

---

## Étape 12: Démarrer avec PM2

```bash
cd ~/app/calcul-heure

# Démarrer l'application
pm2 start ecosystem.config.js

# Vérifier le statut
pm2 status
# Résultat: app en "online"

# Voir les logs
pm2 logs

# Arrêter (Ctrl+C pour quitter logs)
```

### Activation au démarrage du serveur (optionnel)

```bash
# Générer le script de démarrage
pm2 startup

# Sauvegarder la liste PM2
pm2 save

# Vérifier
pm2 list
```

---

## Étape 13: Configurer Nginx

FiveHosting utilise souvent Apache par défaut. **Vous devez vérifier.**

### Vérifier le serveur web

```bash
# Vérifier si Nginx est installé
which nginx

# Vérifier si Apache est installé
which apache2 httpd
```

### Option A: Apache + Proxy (cas FiveHosting standard)

```bash
# Vérifier les modules Apache
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite

# Redémarrer Apache
sudo systemctl restart apache2
```

**Modifier le .htaccess de public_html:**

```bash
cd ~/public_html
nano .htaccess
```

**Contenu:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Proxy vers Node.js
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]
  
  # Headers de proxy
  RequestHeader set X-Forwarded-For %{REMOTE_ADDR}s
  RequestHeader set X-Forwarded-Proto "https"
  RequestHeader set X-Forwarded-Host %{SERVER_NAME}s
</IfModule>
```

### Option B: Nginx (si disponible)

```bash
# Vérifier Nginx
which nginx

# Si Nginx est installé:
sudo nano /etc/nginx/sites-available/calcul-heure
```

**Copier la configuration de nginx-config.conf et adapter**

```bash
# Activer
sudo ln -s /etc/nginx/sites-available/calcul-heure /etc/nginx/sites-enabled/

# Tester
sudo nginx -t

# Redémarrer
sudo systemctl restart nginx
```

---

## Étape 14: Configurer HTTPS

FiveHosting propose Let's Encrypt GRATUIT.

### Via le Panneau FiveHosting

1. Allez sur [fivehosting.net](https://fivehosting.net)
2. Domaines → heurejo.fivehosting.net
3. SSL → Obtenir le certificat (Let's Encrypt)
4. Attendre ~5 minutes
5. Votre site est en HTTPS! ✅

### Via la ligne de commande

```bash
# Si certbot est disponible
which certbot

# Installer si absent
sudo apt-get install certbot python3-certbot-apache

# Obtenir le certificat
sudo certbot certonly -d heurejo.fivehosting.net --webroot -w ~/public_html

# Configurer auto-renouvellement
sudo certbot renew --dry-run
```

---

## Étape 15: Créer un lien public_html vers l'app

FiveHosting sert les fichiers de `/public_html/` au domaine.

**Option A:** Index.html dans public_html qui charge l'app via htaccess (proxy Apache)

**Option B:** Symlink (si disponible)

```bash
cd ~/public_html

# Créer un lien vers l'app
ln -s ~/app/calcul-heure/index.html index.html

# Ou copier les fichiers statiques
cp -r ~/app/calcul-heure/index.html .
```

---

## 🧪 Tester l'application

### Tester en local (sur le serveur)

```bash
# Vérifier si l'app répond
curl http://127.0.0.1:3001

# Tester login
curl -X POST http://127.0.0.1:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Tester via le domaine

Ouvrez votre navigateur et accédez à:

```
https://heurejo.fivehosting.net
```

**Vous devez voir:**
- ✅ Page de login/register
- ✅ Pas d'erreur SSL (cadenas vert)
- ✅ HTTPS dans la barre d'adresse
- ✅ Pas d'erreur 502/503

### Créer un compte de test

1. Cliquez sur "Créer un compte"
2. Entrez: username, email, password
3. Cliquez "S'inscrire"
4. Connectez-vous
5. Testez: ajouter une entrée de travail

---

## 📊 Vérifier le statut

```bash
# Vérifier PM2
pm2 status
pm2 logs calcul-heure

# Vérifier les ports
netstat -tlnp | grep 3001

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h

# Vérifier les fichiers
ls -lah ~/app/calcul-heure/
ls -lah ~/app/calcul-heure/database.db
```

---

## 🔧 Dépannage

### Erreur: "PM2 not found"

```bash
npm install -g pm2
pm2 update
```

### Erreur: "Port 3001 already in use"

```bash
# Voir ce qui utilise le port 3001
lsof -i :3001
netstat -tlnp | grep 3001

# Arrêter le processus
kill -9 <PID>

# Redémarrer PM2
pm2 restart calcul-heure
```

### Erreur: "Cannot find module"

```bash
cd ~/app/calcul-heure
npm install
pm2 restart calcul-heure
```

### L'app démarre mais ne répond pas

```bash
# Vérifier les logs
pm2 logs calcul-heure

# Vérifier le .env
cat .env

# Vérifier la base de données
ls -la database.db

# Redémarrer
pm2 restart calcul-heure
```

### HTTPS ne fonctionne pas

```bash
# Vérifier le certificat
sudo certbot certificates

# Renouveler si proche de l'expiration
sudo certbot renew

# Vérifier Apache/Nginx
sudo systemctl status apache2
sudo systemctl status nginx

# Redémarrer
sudo systemctl restart apache2
```

---

## 📅 Maintenance

### Chaque jour

```bash
pm2 status
# Vérifier que l'app est "online"
```

### Chaque semaine

```bash
# Vérifier les logs
pm2 logs calcul-heure --lines 100

# Vérifier l'espace disque
df -h

# Faire un backup
cp ~/app/calcul-heure/database.db ~/app/calcul-heure/backups/database_$(date +%Y%m%d).db
```

### Chaque mois

```bash
# Vérifier le certificat SSL
sudo certbot certificates

# Mettre à jour Node.js
npm update

# Vérifier les sécurité
npm audit
npm audit fix
```

---

## 🔐 Sécurité - Points importants

- ✅ Changer le JWT_SECRET dans .env (OBLIGATOIRE!)
- ✅ HTTPS activé (cadenas vert)
- ✅ .env n'est pas public (fichier caché)
- ✅ database.db a les bonnes permissions
- ✅ Pas d'accès à node_modules depuis le navigateur

**Vérifier:**

```bash
# .env existe mais est caché
ls -la | grep .env
# Résultat: -rw-r--r-- ... .env

# database.db existe
ls -la database.db

# node_modules ne sont pas publics
ls -la node_modules/ | head
```

---

## 💾 Backup automatique

Créer un script de backup:

```bash
nano ~/backup_calcul_heure.sh
```

**Contenu:**

```bash
#!/bin/bash
BACKUP_DIR="$HOME/app/calcul-heure/backups"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)
cp $HOME/app/calcul-heure/database.db "$BACKUP_DIR/database_$DATE.db"
echo "Backup créé: $BACKUP_DIR/database_$DATE.db"
```

**Rendre exécutable:**

```bash
chmod +x ~/backup_calcul_heure.sh

# Tester
~/backup_calcul_heure.sh
```

**Automatiser via cron (tous les jours à 2h du matin):**

```bash
crontab -e

# Ajouter la ligne:
0 2 * * * ~/backup_calcul_heure.sh
```

---

## 📞 Support

**Problème?**

1. Vérifier les logs: `pm2 logs`
2. Vérifier le .env: `cat .env`
3. Vérifier la connexion SSH
4. Redémarrer: `pm2 restart calcul-heure`
5. Contacter support FiveHosting si besoin d'accès root

---

## ✅ Checklist de déploiement

- [ ] Connexion SSH réussie
- [ ] Node.js v18+ installé
- [ ] Application téléchargée dans ~/app/calcul-heure/
- [ ] npm install réussi (node_modules créé)
- [ ] .env configuré avec JWT_SECRET fort
- [ ] PM2 installé et configuré
- [ ] Application démarrée avec PM2
- [ ] Port 3001 écoute les connexions
- [ ] Apache/Nginx proxy configuré
- [ ] HTTPS activé (Let's Encrypt)
- [ ] Domaine https://heurejo.fivehosting.net fonctionne
- [ ] Login/register testés
- [ ] Workday entries créés avec succès
- [ ] Database sauvegardée
- [ ] Cron backup configuré (optionnel)

---

## 🎉 Résumé: De zéro à production

```
Étape 1: SSH login                    (1 min)
Étape 2: Télécharger l'app            (5 min)
Étape 3: npm install                  (5 min)
Étape 4: Configurer .env              (2 min)
Étape 5: PM2 setup                    (5 min)
Étape 6: Apache proxy                 (5 min)
Étape 7: HTTPS Let's Encrypt          (5 min)
Étape 8: Tester domaine               (5 min)
─────────────────────────────────────
TOTAL:                               ~45 minutes
```

**Après ça, votre app est EN PRODUCTION! 🚀**

---

## Questions fréquentes (FAQ)

**Q: Puis-je utiliser un port plus petit que 3001?**  
R: Non, les ports < 1024 nécessitent les droits root. Utilisez 3001 (ou autre > 1000).

**Q: Et si le port 3001 est occupé?**  
R: `lsof -i :3001` puis `kill -9 <PID>`, ou choisir un autre port.

**Q: Combien de mémoire utilise l'app?**  
R: ~50-100 MB par défaut. Parfait pour FiveHosting.

**Q: Puis-je avoir plusieurs apps Node.js?**  
R: Oui, sur des ports différents (3001, 3002, 3003, etc.) avec PM2.

**Q: Comment mettre à jour le code en production?**  
R: `git pull && npm install && pm2 restart calcul-heure`

**Q: Puis-je accéder à la base de données depuis phpmyadmin?**  
R: Non, SQLite n'est pas MySQL. Mais vous pouvez faire un backup puis l'importer si besoin.

---

**Bonne chance pour votre déploiement! 🎊**

Toute question → Support FiveHosting ou documentation Node.js officielle.
