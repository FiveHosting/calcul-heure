# 🚀 Guide VestaCP FiveHosting - Node.js sur port 3001

**Votre serveur**: VestaCP avec Nginx  
**IP**: 185.171.202.132  
**Domaine**: heurejo.fivehosting.net  
**Chemin VestaCP**: `/home/admin/web/heurejo.fivehosting.net/`  
**Port Node.js**: 3001  

---

## ⏱️ Temps total: 30-45 minutes

```
1. SSH + Download app          (5 min)
2. npm install                  (5 min)
3. .env configuration           (2 min)
4. PM2 setup                    (5 min)
5. Nginx config                 (5 min)
6. HTTPS/SSL                    (5 min)
7. Tester                       (5 min)
```

---

## 📋 Prérequis VestaCP

- ✅ Accès SSH VestaCP (`admin` ou `votre_user`)
- ✅ Node.js 18+ (vérifier ou installer)
- ✅ PM2 disponible
- ✅ Nginx configuré (c'est votre cas!)
- ✅ HTTPS Let's Encrypt

---

## Étape 1: Connexion SSH

```bash
# Sur Windows PowerShell
ssh admin@185.171.202.132
# Ou avec le hostname
ssh admin@votre_serveur.com

# Mot de passe VestaCP admin
```

### Vérifier l'accès

```bash
# Voir votre chemin
pwd
# Résultat: /root (pour admin)

# Voir les domaines
ls /home/admin/web/
# Résultat: heurejo.fivehosting.net (etc)
```

---

## Étape 2: Télécharger l'application

```bash
# Créer dossier pour l'app
mkdir -p /home/admin/web/heurejo.fivehosting.net/calcul-heure
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Via Git (recommandé)
git clone https://github.com/votre_user/calcul-heure .

# OU via SCP depuis votre PC (PowerShell)
# scp -r ./* admin@185.171.202.132:/home/admin/web/heurejo.fivehosting.net/calcul-heure/

# Vérifier les fichiers
ls -la
# Vous devez voir: package.json, server.js, .env, etc
```

---

## Étape 3: Installer les dépendances

```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Installer Node
which node
# Si pas installé:
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# sudo apt-get install -y nodejs

# Installer npm
npm install

# Résultat: added XXX packages
```

---

## Étape 4: Configurer .env

```bash
nano /home/admin/web/heurejo.fivehosting.net/calcul-heure/.env
```

**Contenu requis:**

```
PORT=3001
DB_PATH=./database.db
JWT_SECRET=GÉNÉRER_UNE_CLÉ_FORTE_32_CHARS_MIN
NODE_ENV=production
```

### Générer JWT_SECRET fort

```bash
openssl rand -base64 32
# Exemple: wK8hJ2nL9pQ5rT6vX8yZ1aB3cD4eF6gH7iJ9kL0mN2oP4qR6sT8uV0w

# Copier dans .env
```

**Sauvegarder:** Ctrl+O → Enter → Ctrl+X

---

## Étape 5: Vérifier Node.js + PM2

```bash
# Vérifier Node
node --version
# v18.x.x

# Vérifier npm
npm --version
# 9.x.x

# Installer PM2 globalement (si absent)
npm install -g pm2

# Vérifier PM2
pm2 --version
# 5.x.x
```

---

## Étape 6: Configurer PM2

```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Créer ecosystem.config.js
nano ecosystem.config.js
```

**Contenu:**

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

**Sauvegarder:** Ctrl+O → Enter → Ctrl+X

### Démarrer PM2

```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Démarrer l'app
pm2 start ecosystem.config.js

# Vérifier le statut
pm2 status
# Résultat: online ✅

# Voir les logs
pm2 logs
# Ctrl+C pour quitter
```

### Activation au démarrage (optionnel)

```bash
# Générer startup script
pm2 startup

# Sauvegarder
pm2 save

# Vérifier
pm2 list
```

---

## Étape 7: Configurer Nginx

C'est la partie VestaCP importante!

### Récupérer votre config existante

```bash
cat /home/admin/conf/web/nginx.heurejo.fivehosting.net.conf
```

### Adapater pour Node.js + port 3001

```bash
# Éditer votre config VestaCP Nginx
sudo nano /home/admin/conf/web/nginx.heurejo.fivehosting.net.conf
```

**Remplacer le contenu par:** (voir fichier `nginx-config-FIVEHOSTING-FINAL.conf`)

**Points à adapter:**
- IP: `185.171.202.132` (votre IP)
- Domaine: `heurejo.fivehosting.net`
- Chemin SSL: `/etc/letsencrypt/live/heurejo.fivehosting.net/`
- Proxy: `http://127.0.0.1:3001` ← **PORT 3001**

**Sauvegarder:** Ctrl+O → Enter → Ctrl+X

---

## Étape 8: Tester la config Nginx

```bash
# Tester la syntax
sudo nginx -t
# Résultat: syntax is ok ✅

# Recharger Nginx
sudo systemctl reload nginx

# Vérifier le statut
sudo systemctl status nginx
```

---

## Étape 9: Vérifier los ports

```bash
# Vérifier que Node.js écoute sur 3001
sudo netstat -tlnp | grep 3001
# Résultat: node (PID) sur 127.0.0.1:3001

# Vérifier que Nginx écoute sur 80 et 443
sudo netstat -tlnp | grep nginx
```

---

## Étape 10: Configurer HTTPS/SSL

### Via VestaCP Panel (le plus facile)

1. Allez sur: `https://votre_vps.com:8083/`
2. Se connecter avec admin
3. Domaines → heurejo.fivehosting.net
4. SSL → Activer (Let's Encrypt gratuit) ✅
5. Attendre 5 minutes

### Via Certbot (ligne de commande)

```bash
# Si certbot n'est pas installé
sudo apt-get install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot certonly --nginx -d heurejo.fivehosting.net

# Renouvellement auto (test)
sudo certbot renew --dry-run

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 🧪 Tester votre application

### Tester en local (sur le serveur)

```bash
# Tester Node.js
curl http://127.0.0.1:3001
# Résultat: HTML de l'app

# Tester login
curl -X POST http://127.0.0.1:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Tester via le domaine (depuis votre PC)

Ouvrez navigateur:
```
https://heurejo.fivehosting.net
```

**Vérifier:**
- ✅ Pas d'erreur SSL (cadenas vert)
- ✅ Page de login/register s'affiche
- ✅ Pas d'erreur 502/503/504
- ✅ API fonctionne (créer compte, login, ajouter entrée)

---

## 📊 Monitoring

```bash
# État PM2
pm2 status
pm2 logs calcul-heure

# État Nginx
sudo systemctl status nginx
sudo journalctl -u nginx -f

# Espace disque
df -h

# Mémoire
free -h

# Processus Node
ps aux | grep node
```

---

## 🔧 Démarrer/Arrêter/Redémarrer

```bash
# Démarrer l'app
pm2 start calcul-heure

# Arrêter
pm2 stop calcul-heure

# Redémarrer
pm2 restart calcul-heure

# Supprimer (attention!)
pm2 delete calcul-heure

# Rechanger après modifs du code:
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure
git pull
npm install
pm2 restart calcul-heure
```

---

## 💾 Sauvegarder la base de données

```bash
# Backup manuel
mkdir -p /home/admin/web/heurejo.fivehosting.net/calcul-heure/backups
cp /home/admin/web/heurejo.fivehosting.net/calcul-heure/database.db \
   /home/admin/web/heurejo.fivehosting.net/calcul-heure/backups/database_$(date +%Y%m%d_%H%M%S).db

# Vérifier les backups
ls -la /home/admin/web/heurejo.fivehosting.net/calcul-heure/backups/
```

### Backup automatique via cron

```bash
# Éditer crontab
crontab -e

# Ajouter (tous les jours à 2h du matin):
0 2 * * * cp /home/admin/web/heurejo.fivehosting.net/calcul-heure/database.db \
            /home/admin/web/heurejo.fivehosting.net/calcul-heure/backups/database_$(date +\%Y\%m\%d).db

# Sauvegarder et quitter
```

---

## 🔐 Sécurité - Vérifications

```bash
# .env n'est pas public
curl https://heurejo.fivehosting.net/.env
# Résultat: 404 ✅

# node_modules caché
curl https://heurejo.fivehosting.net/node_modules/
# Résultat: 404 ✅

# database.db caché
curl https://heurejo.fivehosting.net/database.db
# Résultat: n'existe pas ou 404 ✅

# git caché
curl https://heurejo.fivehosting.net/.git/
# Résultat: 404 ✅
```

---

## 🆘 Erreurs courantes

### "Port 3001 already in use"

```bash
# Voir ce qui utilise le port
sudo lsof -i :3001
netstat -tlnp | grep 3001

# Tuer le processus
sudo kill -9 <PID>

# Redémarrer PM2
pm2 restart calcul-heure
```

### "Cannot find module 'express'"

```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure
npm install
pm2 restart calcul-heure
```

### "HTTPS ne fonctionne pas"

```bash
# Vérifier le certificat
sudo certbot certificates

# Recharger Nginx
sudo systemctl reload nginx

# Tester la sintaxe
sudo nginx -t

# Voir les erreurs
sudo journalctl -u nginx -n 50
```

### "502 Bad Gateway"

```bash
# Vérifier que Node.js écoute
sudo netstat -tlnp | grep 3001

# Vérifier les logs PM2
pm2 logs calcul-heure

# Vérifier que Nginx a la bonne config
sudo cat /home/admin/conf/web/nginx.heurejo.fivehosting.net.conf | grep 3001
```

### "Database locked"

```bash
# Arrêter PM2
pm2 stop calcul-heure

# Attendre 5 secondes
sleep 5

# Redémarrer
pm2 start calcul-heure
```

---

## ✅ Checklist final

- [ ] SSH connexion OK
- [ ] Git clone réussi
- [ ] npm install terminé
- [ ] .env configuré (JWT_SECRET changé)
- [ ] Node.js écoute sur port 3001
- [ ] PM2 démarre l'app
- [ ] Nginx reload sans erreur
- [ ] HTTPS certificat valide
- [ ] https://heurejo.fivehosting.net fonctionne
- [ ] Login/register testés
- [ ] Peut créer une entrée de travail
- [ ] Peut afficher les entrées
- [ ] Base de données sauvegardée
- [ ] Cron backup configuré

---

## 📞 Troubleshooting - Commandes utiles

```bash
# Afficher tous les commandes PM2
pm2 help

# Logs temps réel
pm2 logs --lines 100 --follow

# Reboot le server
sudo systemctl restart nginx && pm2 restart calcul-heure

# Status complet
pm2 monit

# Archiver les logs
pm2 logs --format json > logs_backup.json
```

---

## 🎉 Résumé

Vous avez maintenant:
- ✅ Application Node.js déployée sur VestaCP
- ✅ Port 3001 dédié
- ✅ PM2 pour la gestion des processus
- ✅ Nginx reverse proxy configuré
- ✅ HTTPS/SSL actif
- ✅ Base de données SQLite
- ✅ Authentication JWT
- ✅ Sauvegardes automatiques

**Application en PRODUCTION sur https://heurejo.fivehosting.net** 🚀

---

## 📖 Documentation associée

- `nginx-config-FIVEHOSTING-FINAL.conf` - Configuration Nginx complète
- `.env` - Variables d'environnement
- `README.md` - Documentation générale
- `ecosystem.config.js` - Config PM2

Bon déploiement! 🎊
