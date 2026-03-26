# 🚀 GUIDE COMPLET: CALCUL-HEURE SUR VestaCP

## Vue d'ensemble
Ce guide explique comment déployer votre **Calculateur d'Heures v2.0** sur un VPS avec **VestaCP**.

## 📋 Checklist pré-déploiement

- [ ] VPS avec VestaCP configuré
- [ ] Domaine pointant vers le VPS
- [ ] Accès SSH disponible
- [ ] Node.js v18+ installé
- [ ] Préparé le JWT_SECRET
- [ ] Fait un backup local de database.db

---

## 🎯 Résumé des étapes

| Étape | Action | Temps |
|-------|--------|-------|
| 1 | Préparer le serveur | 10 min |
| 2 | Créer dossier application | 5 min |
| 3 | Uploader/Cloner l'app | 10 min |
| 4 | Installer dépendances | 5 min |
| 5 | Configurer .env | 5 min |
| 6 | Setup PM2 | 5 min |
| 7 | Configurer Nginx | 10 min |
| 8 | Activer SSL | 5 min |
| 9 | Tester l'app | 5 min |
| **TOTAL** | | **60 min** |

---

## 🔑 Commandes clés à retenir

```bash
# Se connecter
ssh root@ip_serveur

# Dossier app
cd /home/admin/calcul-heure

# Démarrer avec PM2
pm2 start server.js --name "calcul-heure"

# Voir les logs
pm2 logs calcul-heure

# Redémarrer
pm2 restart calcul-heure

# Changer config Nginx
sudo nano /etc/nginx/sites-available/calcul-heure
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📍 Emplacements importants

```
🏠 Dossier app:          /home/admin/calcul-heure/
📄 Config Nginx:         /etc/nginx/sites-available/calcul-heure
🔐 Certificats SSL:      /home/admin/conf/web/
📊 Database:             /home/admin/calcul-heure/database.db
📝 Logs Nginx:           /home/admin/logs/
🔄 PM2:                  pm2 status
```

---

## 🚨 Erreurs courantes

### ❌ "502 Bad Gateway"
**Solution:** 
```bash
pm2 status                    # Vérifier app
pm2 restart calcul-heure      # Redémarrer
pm2 logs calcul-heure         # Voir logs
```

### ❌ "Connection refused"
**Solution:**
```bash
netstat -tlnp | grep 3000     # Port 3000?
sudo nginx -t                 # Config OK?
sudo systemctl restart nginx  # Redémarrer Nginx
```

### ❌ "Cannot find module"
**Solution:**
```bash
cd /home/admin/calcul-heure
npm install                   # Réinstaller
pm2 restart calcul-heure
```

### ❌ "Database locked" ou "Cannot open database"
**Solution:**
```bash
cd /home/admin/calcul-heure
rm database.db                # Supprimer vieille DB
pm2 restart calcul-heure      # Nouvelle DB créée
chmod 644 database.db         # Permissions
```

---

## 🔄 Maintenance régulière

### Quotidien
```bash
# Vérifier l'app
pm2 status

# Voir si des erreurs
pm2 logs calcul-heure --lines 50
```

### Hebdomadaire
```bash
# Vérifier l'espace disque
df -h

# Localiser les gros fichiers
du -sh /home/admin/calcul-heure/*
```

### Mensuel
```bash
# Backup de la DB
cp /home/admin/calcul-heure/database.db \
   /home/admin/backups/database-backup-$(date +%Y%m%d).db

# Vérifier certificat SSL (reste X jours)
sudo certbot certificates
```

---

## 🔐 Sécurité essentialisée

### Étape 1: JWT Secret
⚠️ **CRITIQUE** - Changez-le absolument

```bash
# Générer une clé sécurisée
openssl rand -base64 32

# Exemple de résultat:
# aBc+DefGhijKlmnOpQrsTuvWxyz123456789/01==

# Mettre dans .env
JWT_SECRET=aBc+DefGhijKlmnOpQrsTuvWxyz123456789/01==
```

### Étape 2: HTTPS obligatoire
```nginx
# Auto-redirection HTTP → HTTPS
return 301 https://$server_name$request_uri;
```

### Étape 3: Firewall
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Étape 4: Permissions fichiers
```bash
chmod 600 /home/admin/calcul-heure/.env
chmod 644 /home/admin/calcul-heure/database.db
```

---

## 📊 Monitoring

### Vérifier l'application

```bash
# Via terminal SSH
curl http://localhost:3000

# Via PM2
pm2 status
pm2 monit

# Test API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Logs importants

```bash
# App Node.js
pm2 logs calcul-heure
pm2 logs calcul-heure --lines 100

# Nginx
tail -f /home/admin/logs/calcul-heure.access.log
tail -f /home/admin/logs/calcul-heure.error.log

# Système
journalctl -u nginx -f
```

---

## 🆘 Situations urgentes

### Application ne démarre pas

```bash
# Étape 1: Vérifier les erreurs
pm2 logs calcul-heure

# Étape 2: Vérifier les permissions
ls -la /home/admin/calcul-heure/

# Étape 3: Tester manuellement
cd /home/admin/calcul-heure
node server.js

# Étape 4: Redémarrer PM2
pm2 restart calcul-heure
```

### La base de données est corrompue

```bash
# Sauvegarder avant suppression
cp database.db database.db.corrupt

# Supprimer la DB
rm database.db

# Redémarrer (nouvelle BD créée)
pm2 restart calcul-heure

# Vérifier
pm2 logs calcul-heure
```

### Port occupé

```bash
# Voir qui utilise le port 3000
sudo lsof -i :3000
# OU
netstat -tlnp | grep 3000

# Tuer le processus
sudo kill -9 PROCESSID

# Redémarrer l'app
pm2 restart calcul-heure
```

---

## 📱 Test depuis l'extérieur

```bash
# Une fois déployé, tester:
curl https://votre_domaine.com

# Tester l'API
curl -X POST https://votre_domaine.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

---

## 🎯 Configuration finale idéale

```
┌─────────────────────┐
│  votre_domaine.com  │
│    (HTTPS, SSL)     │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │ Nginx       │
    │ (reverse    │
    │  proxy)     │
    └──────┬──────┘
           │
           ▼ :3000
┌─────────────────────┐
│ Node.js App         │
│ (Express)           │
│ (PM2 managed)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ SQLite Database     │
│ (/home/admin/.../)  │
│ (Backupé réguli)    │
└─────────────────────┘
```

---

## ✅ Checklist de validation

Après déploiement, vérifier:

- [ ] `pm2 status` → App est en ligne
- [ ] Date dans logs est actuelle
- [ ] Nginx tourne: `sudo systemctl status nginx`
- [ ] SSL valide: Vérifier certificat dans barre adresse
- [ ] Domaine fonctionne: Ouvrir https://votre_domaine.com
- [ ] Inscription possible: Créer test@test.com
- [ ] Ajouter heure fonctionne
- [ ] Données sauvegardées (rafraîchir l'app)
- [ ] Firewall n'a pas bloqué les ports
- [ ] Backup de database.db fait

---

## 📞 Ressources utiles

- **VestaCP Docs**: https://vestacp.com/
- **PM2 Guide**: https://pm2.keymetrics.io/
- **Nginx Config**: https://nginx.org/en/docs/
- **Node.js**: https://nodejs.org/
- **Let's Encrypt**: https://letsencrypt.org/

---

## 🎯 Résumé pour passer en production

```bash
# 1️⃣ Préparer le serveur
ssh root@ip_serveur
sudo apt-get update && sudo apt-get upgrade
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 2️⃣ Créer et remplir dossier app
sudo mkdir -p /home/admin/calcul-heure
cd /home/admin/calcul-heure
# Uploader les fichiers OU git clone

# 3️⃣ Installer et configurer
npm install
nano .env  # Changer JWT_SECRET et NODE_ENV=production

# 4️⃣ Démarrer avec PM2
pm2 start server.js --name "calcul-heure"
pm2 startup
pm2 save

# 5️⃣ Configurer Nginx (copier la config du README)
sudo nano /etc/nginx/sites-available/calcul-heure
sudo ln -s /etc/nginx/sites-available/calcul-heure /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6️⃣ SSL (Let's Encrypt)
sudo certbot certonly --nginx -d votre_domaine.com

# 7️⃣ Vérifier
pm2 status
curl https://votre_domaine.com
```

**ETA: 60 minutes de travail**

---

**C'est tout! Votre app est en production! 🎉**

**Pour du support**, consultez le README.md section "DÉPLOIEMENT SUR VPS avec VestaCP"
