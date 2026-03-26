# 🚀 DÉPLOIEMENT FINAL - VestaCP + Node.js 3001

## Votre config VestaCP

```
Serveur: VestaCP Nginx
IP: 185.171.202.132
Domaine: heurejo.fivehosting.net
Certificat SSL: /home/admin/conf/web/ssl.heurejo.fivehosting.net.pem
Port Node.js: 3001
Chemin code: /home/admin/web/heurejo.fivehosting.net/calcul-heure/
```

---

## 📋 Étapes de déploiement (30 min)

### 1️⃣ SSH + Télécharger le code (5 min)

```bash
# Connexion SSH
ssh admin@185.171.202.132

# Créer dossier application
mkdir -p /home/admin/web/heurejo.fivehosting.net/calcul-heure
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Télécharger le code (Git)
git clone https://github.com/votre_user/calcul-heure .

# OU transfert depuis votre PC (PowerShell):
# scp -r ./* admin@185.171.202.132:/home/admin/web/heurejo.fivehosting.net/calcul-heure/

# Vérifier
ls -la
# Vous devez voir: package.json, server.js, .env, database.js, etc
```

---

### 2️⃣ Installation npm (5 min)

```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Vérifier Node.js
node --version
# Min: v18.x.x

# Installer dépendances
npm install

# Résultat: added XXX packages
# Les fichiers node_modules sont créés
```

---

### 3️⃣ Configurer .env (2 min)

```bash
# Éditer le fichier .env
nano /home/admin/web/heurejo.fivehosting.net/calcul-heure/.env
```

**Contenu à adapter:**

```
PORT=3001
DB_PATH=./database.db
JWT_SECRET=GÉNÉRER_UNE_CLÉ_32_CHARS_MIN
NODE_ENV=production
```

**Générer JWT_SECRET:**

```bash
openssl rand -base64 32

# Exemple de résultat:
# aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3c4d5e6f7g8h9i0

# Copier ce résultat dans .env à la place de JWT_SECRET
```

**Sauvegarder dans nano:**
- Ctrl+O
- Enter (confirmer)
- Ctrl+X (quitter)

---

### 4️⃣ Installer PM2 (2 min)

```bash
# Installation globale
npm install -g pm2

# Vérifier
pm2 --version
# Résultat: 5.x.x
```

---

### 5️⃣ Créer config PM2 (2 min)

```bash
# Créer ecosystem.config.js
nano /home/admin/web/heurejo.fivehosting.net/calcul-heure/ecosystem.config.js
```

**Copier ce code:**

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

---

### 6️⃣ Démarrer l'application PM2 (1 min)

```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Démarrer
pm2 start ecosystem.config.js

# Vérifier le statut
pm2 status

# Résultat: app "online" ✅
```

### Vérifier que ça tourne (optionnel)

```bash
# Voir les logs
pm2 logs calcul-heure

# Tester localement
curl http://127.0.0.1:3001
# Résultat: HTML de l'app

# Ctrl+C pour quitter les logs
```

---

### 7️⃣ Adapter la config Nginx (5 min) ⭐ IMPORTANT

**Cette étape est CRITIQUE!**

```bash
# Éditer la config Nginx VestaCP
sudo nano /home/admin/conf/web/nginx.heurejo.fivehosting.net.conf
```

**Option A: Copier la config complète**

Ouvrir le fichier `nginx-vestacp-PROD.conf` dans votre repo et copier **TOUT** le contenu dans le fichier Nginx de VestaCP.

**Option B: Modifier manuellement** (si vous une config existante)

Trouver la section HTTPS et remplacer:
```nginx
proxy_pass https://185.171.202.132:8443;
```

Par:
```nginx
proxy_pass http://127.0.0.1:3001;
```

Et ajouter les headers:
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

---

### 8️⃣ Tester la config Nginx (2 min)

```bash
# Tester si la syntax est OK
sudo nginx -t

# Résultat: "syntax is ok" ✅

# Recharger Nginx
sudo systemctl reload nginx

# Vérifier le status
sudo systemctl status nginx
# Doit afficher: active (running) ✅
```

---

### 9️⃣ Vérifier les ports (1 min)

```bash
# Vérifier Node.js sur 3001
sudo netstat -tlnp | grep 3001
# Résultat: node (PID) sur 127.0.0.1:3001

# Vérifier Nginx sur 443
sudo netstat -tlnp | grep nginx
# Résultat: nginx sur 0.0.0.0:443
```

---

### 🔟 Tester le domaine (2 min)

**Sur votre navigateur:**

```
https://heurejo.fivehosting.net
```

**Vérifier:**
- ✅ Pas de erreur SSL (cadenas vert 🔒)
- ✅ Page de login s'affiche
- ✅ Pas d'erreur 502 Bad Gateway
- ✅ Pas d'erreur 503 Service Unavailable

**Tester l'application:**
1. Créer un compte
2. Se connecter
3. Ajouter une entrée de travail
4. Vérifier que les données s'enregistrent

**Si tout fonctionne:** ✅ **DÉPLOIEMENT RÉUSSI!**

---

## 🆘 Erreurs courantes

### "502 Bad Gateway"

```bash
# Vérifier que Node.js écoute bien
sudo netstat -tlnp | grep 3001

# Vérifier les logs Node.js
pm2 logs calcul-heure

# Redémarrer
pm2 restart calcul-heure
```

### "Cannot connect - connection refused"

```bash
# Vérifier la config Nginx
grep "proxy_pass" /home/admin/conf/web/nginx.heurejo.fivehosting.net.conf
# Doit afficher: proxy_pass http://127.0.0.1:3001

# Recharger Nginx
sudo systemctl reload nginx
```

### "Port 3001 already in use"

```bash
# Voir ce qui utilise le port
sudo lsof -i :3001

# Tuer le processus (attention!)
kill -9 <PID>

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
ls -la /home/admin/conf/web/ssl.heurejo.fivehosting.net.pem
ls -la /home/admin/conf/web/ssl.heurejo.fivehosting.net.key

# Tester Nginx
sudo nginx -t

# Recharger
sudo systemctl reload nginx

# Voir les erreurs
sudo tail -50 /var/log/nginx/error.log
```

---

## 📊 Monitoring

```bash
# État PM2
pm2 status
pm2 monit

# Logs temps réel
pm2 logs

# Espace disque
df -h

# Mémoire
free -h

# Processus
ps aux | grep node
```

---

## 🔄 Redémarrage/Arrêt

```bash
# Redémarrer l'app
pm2 restart calcul-heure

# Arrêter
pm2 stop calcul-heure

# Démarrer
pm2 start ecosystem.config.js

# Voir status
pm2 status
```

---

## 💾 Sauvegarde database

```bash
# Backup manuel
mkdir -p /home/admin/web/heurejo.fivehosting.net/calcul-heure/backups
cp /home/admin/web/heurejo.fivehosting.net/calcul-heure/database.db \
   /home/admin/web/heurejo.fivehosting.net/calcul-heure/backups/database_$(date +%Y%m%d).db

# Lister les backups
ls -la /home/admin/web/heurejo.fivehosting.net/calcul-heure/backups/
```

---

## 🚀 Mise à jour du code en production

```bash
cd /home/admin/web/heurejo.fivehosting.net/calcul-heure

# Récupérer les nouvelles modifications
git pull

# Réinstaller dépendances (si changement package.json)
npm install

# Redémarrer l'app
pm2 restart calcul-heure

# Vérifier
pm2 status
```

---

## ✅ Checklist final

- [ ] SSH accès OK
- [ ] Code téléchargé
- [ ] npm install réussi
- [ ] .env configuré (JWT_SECRET changé)
- [ ] Node.js 18+ présent
- [ ] PM2 installé
- [ ] ecosystem.config.js créé
- [ ] PM2 app lancée et "online"
- [ ] Nginx config adapté (proxy_pass 3001)
- [ ] Nginx tester: syntax ok
- [ ] Nginx reload sans erreur
- [ ] Port 3001 écoute (127.0.0.1)
- [ ] Port 443 écoute (Nginx)
- [ ] https://heurejo.fivehosting.net accessible
- [ ] Login/Register testé
- [ ] Workday entries créées et sauvegardées

---

## 🎉 Résumé

**Vous avez maintenant:**
- ✅ Application Node.js v2.0 déployée
- ✅ Port 3001 dédié
- ✅ PM2 pour la gestion des processus
- ✅ Nginx reverse proxy configuré
- ✅ HTTPS/SSL activé (certificats VestaCP)
- ✅ Base de données SQLite persistente
- ✅ Authentication JWT
- ✅ Calculatrice d'heures fonctionnelle

**STATUS:** 🟢 **PRODUCTION READY**

**Accessible:** https://heurejo.fivehosting.net 🚀

---

**Besoin d'aide?**
1. **Logs:** `pm2 logs`
2. **Config Nginx:** `/home/admin/conf/web/nginx.heurejo.fivehosting.net.conf`
3. **Application:** `/home/admin/web/heurejo.fivehosting.net/calcul-heure/`

Bon déploiement! 🎊
