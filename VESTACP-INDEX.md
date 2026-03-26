# 🚀 INDEX VestaCP - Tous les fichiers pour Production

## 📋 Accès rapide aux fichiers

### 📖 Documentation complète

1. **[README.md](README.md)**
   - Section: "🚀 DÉPLOIEMENT SUR VPS avec VestaCP"
   - 80+ lignes de guide détaillé
   - Étape par étape du déploiement

2. **[VESTACP-GUIDE.md](VESTACP-GUIDE.md)**
   - Guide ultra-complet et détaillé
   - Troubleshooting complet
   - Monitoring et maintenance
   - 300+ lignes

3. **[RESUME-VESTACP.txt](RESUME-VESTACP.txt)**
   - Résumé concis (à lire en premier!)
   - 3 options de déploiement
   - Checklist
   - 250+ lignes

### 🛠️ Fichiers de déploiement

4. **[deploy-vestacp.sh](deploy-vestacp.sh)**
   - Script d'installation automatique
   - Fait 95% du travail
   - Juste à exécuter: `bash deploy-vestacp.sh`
   - Exécution: ~5 minutes

5. **[nginx-config.conf](nginx-config.conf)**
   - Configuration Nginx prête
   - Reverse proxy, SSL, sécurité
   - Juste adapter le domaine
   - ~200 lignes bien commentées

### ⚙️ Configuration

6. **.env**
   - Variables d'environnement
   - À adapter avant production:
     - JWT_SECRET (très important!)
     - PORT (normalement 3000)
     - NODE_ENV (production)

---

## 🎯 Ordre de lecture pour déployer

### Pour les pressés (15 min)

```
1️⃣ RESUME-VESTACP.txt         ← Lisez d'abord
   "Lancement rapide" section

2️⃣ bash deploy-vestacp.sh      ← Exécutez
   Répondez aux questions

3️⃣ nginx-config.conf           ← Copiez et adaptez
   Juste changer le domaine

4️⃣ test https://votre_domaine.com ✅
```

### Pour bien comprendre (45 min)

```
1️⃣ RESUME-VESTACP.txt          ← Vue d'ensemble
   Points clés à retenir

2️⃣ VESTACP-GUIDE.md            ← Concepts
   Comprendre l'architecture

3️⃣ README.md (Section VestaCP) ← Détails
   Ligne par ligne

4️⃣ deploy-vestacp.sh           ← Comprendre
   Voir ce que fait le script

5️⃣ Déployer avec compréhension
```

---

## 📊 Contenu des fichiers VestaCP

### README.md - Section VestaCP (80+ lignes)
```
✅ Prérequis
✅ Préparer le serveur
✅ Créer dossier
✅ Upload/Clone app
✅ Configurer .env
✅ Démarrer avec PM2
✅ Configurer Nginx
✅ Activer SSL
✅ Troubleshooting
✅ Maintenance
✅ Sécurité
```

### VESTACP-GUIDE.md (300+ lignes)
```
✅ Vue d'ensemble et timing
✅ Commandes clés à retenir
✅ Emplacements importants
✅ Erreurs courantes et solutions
✅ Maintenance quotidienne/hebdo/mensuelle
✅ Monitoring et logs
✅ Situations urgentes
✅ Tests
✅ Configuration finale
✅ Checklist de validation
✅ Ressources utiles
✅ Résumé complet pour production
```

### deploy-vestacp.sh (200+ lignes)
```
✅ Automatique
✅ Vérification Node.js
✅ Installation PM2
✅ Création dossiers
✅ npm install
✅ Configuration .env
✅ Génération JWT_SECRET
✅ PM2 setup
✅ Auto-startup
✅ Rapport final
```

### nginx-config.conf (200+ lignes)
```
✅ Redirection HTTP → HTTPS
✅ Configuration SSL/TLS
✅ Headers de sécurité
✅ Reverse proxy
✅ Compression gzip
✅ Timeouts
✅ Blocage fichiers sensibles
✅ Cache
✅ Logs
✅ Commentaires détaillés
```

---

## 🚀 Déploiement rapide en 3 étapes

### Étape 1: Se connecter

```bash
ssh root@votre_ip_serveur
# OU
ssh admin@votre_domaine.com
```

### Étape 2: Exécuter le script

```bash
# Télécharger depuis votre repo
git clone https://votre_repo/calcul-heure.git
cd calcul-heure

# Ou manuellement uploader les fichiers

# Exécuter l'installation
bash deploy-vestacp.sh
```

### Étape 3: Configurer Nginx

```bash
# Copier et éditer
sudo nano /etc/nginx/sites-available/calcul-heure
# Copier le contenu de nginx-config.conf

# Remplacer "votre_domaine.com" par votre domaine

# Activer
sudo ln -s /etc/nginx/sites-available/calcul-heure /etc/nginx/sites-enabled/

# Test et restart
sudo nginx -t
sudo systemctl restart nginx
```

**PRÊT!** ✅ Accédez à https://votre_domaine.com

---

## 🎯 Fichiers essentiels par situation

### "Je vais déployer tout seul"
→ Lire: VESTACP-GUIDE.md

### "Je veux l'automatiser"
→ Utiliser: deploy-vestacp.sh

### "Je veux juste la config Nginx"
→ Utiliser: nginx-config.conf

### "Je veux comprendre"
→ Lire: README.md (section VestaCP)

### "J'ai peu de temps"
→ Lire: RESUME-VESTACP.txt (Résumé en 30 sec)

### "Je ne sais pas par où commencer"
→ Lire l'ordre: RESUME-VESTACP.txt → deploy-vestacp.sh → Tester

---

## ⚠️ Points CRITIQUES avant production

### 1. JWT_SECRET ⚠️ OBLIGATOIRE
**AVANT:** `JWT_SECRET=votre_clé_secrète_très_sûre_à_changer_en_production`
**APRÈS:** `JWT_SECRET=aBc+DefGhijKlmnOpQrsTuvWxyz123456789/01==`

Générer avec:
```bash
openssl rand -base64 32
```

### 2. NODE_ENV ⚠️ IMPORTANT
```
NODE_ENV=production
```

### 3. HTTPS ⚠️ OBLIGATOIRE
Ne JAMAIS en production sans SSL!

### 4. Domaine ⚠️ À ADAPTER
Tous les fichiers ont `votre_domaine.com` à remplacer

### 5. Permissions ⚠️ À VÉRIFIER
```bash
chmod 600 .env              # Fichier secret
chmod 644 database.db       # Database
chmod 755 /home/admin/      # Dossier principal
```

---

## 📞 Aide rapide par problème

### "502 Bad Gateway"
→ Lire: VESTACP-GUIDE.md (section Troubleshooting)
→ Commande: `pm2 logs calcul-heure`

### "Cannot find module"
→ Lire: VESTACP-GUIDE.md (section "npm install")
→ Commande: `npm install`

### "Database locked"
→ Lire: VESTACP-GUIDE.md (section Situations urgentes)
→ Commande: `rm database.db && pm2 restart calcul-heure`

### "SSL error"
→ Lire: README.md (section SSL)
→ Commande: `certbot certificates`

### "Port déjà utilisé"
→ Lire: VESTACP-GUIDE.md (section Port occupé)
→ Commande: `netstat -tlnp | grep 3000`

---

## 🔍 Vérification du déploiement

```
✅ App accessible: https://votre_domaine.com
✅ SSL valide: Vérifier cadenas
✅ Inscription marche: Créer compte test
✅ Ajouter heure marche: Ajouter entrée
✅ Données persistent: Rafraîchir page
✅ Logs bons: pm2 logs calcul-heure
✅ Backup fait: Copier database.db
```

---

## 📚 Structure de chaque fichier VestaCP

### README.md
```
Section: "🚀 DÉPLOIEMENT SUR VPS avec VestaCP"
Description: Chapitre complet dédié
Contient: 
  - Prérequis
  - 9 étapes détaillées
  - Troubleshooting
  - Maintenance
  - Sécurité
  - Tips & Tricks
```

### VESTACP-GUIDE.md
```
Description: Guide standalone ulta-complet
Contient:
  - Vue d'ensemble + timing
  - Erreurs courantes
  - Monitoring
  - Situations urgentes
  - Tests
  - Ressources
```

### deploy-vestacp.sh
```
Description: Script d'installation automatique
Fait:
  - Vérifie Node.js
  - Installe PM2
  - Crée dossiers
  - Installe dépendances
  - Configure PM2
  - Génère JWT_SECRET
```

### nginx-config.conf
```
Description: Configuration Nginx prête
Contient:
  - HTTP → HTTPS
  - SSL/TLS setup
  - Sécurité
  - Reverse proxy
  - Blocages sensibles
  - Logs et monitoring
```

---

## 🎯 Les 5 commandes les plus importantes

```bash
# 1. Voir l'état
pm2 status

# 2. Voir les erreurs
pm2 logs calcul-heure

# 3. Redémarrer
pm2 restart calcul-heure

# 4. Tester Nginx
sudo nginx -t && sudo systemctl restart nginx

# 5. Vérifier SSL
curl -I https://votre_domaine.com
```

---

## ✅ Checklist final avant "go live"

- [ ] JWT_SECRET changé et fort
- [ ] NODE_ENV=production
- [ ] Domaine configuré dans nginx-config.conf
- [ ] SSL certificat activé
- [ ] database.db backup
- [ ] Firewall ouvert: 22, 80, 443
- [ ] App accessible: HTTPS OK
- [ ] Inscription marche
- [ ] Ajouter heure marche
- [ ] Logs sans erreur
- [ ] Performance acceptable (< 5s par requête)

---

## 🚀 Vous êtes prêt à déployer!

**Fichiers disponibles:**
- ✅ Documentation complète
- ✅ Script d'installation
- ✅ Configuration serveur
- ✅ Guides troubleshooting

**Temps nécessaire:**
- 🚀 Service script: 15 min
- 🚀 Manuel: 45 min
- 🚀 Hybride: 25 min

**Support:**
- 📖 Lire la doc
- 🛠️ Exécuter le script
- ✅ Tester

**Bonne chance! 🎉**

---

**Version**: 2.0.0  
**Date**: Mars 2026  
**Statut**: ✅ PRODUCTION READY
