# 🚀 Guide de Démarrage Rapide

## Ce qui a été mis en place

✅ **Backend complet** avec Node.js et Express  
✅ **Base de données SQLite** pour persister les données  
✅ **Authentification JWT** sécurisée  
✅ **Hachage des mots de passe** avec bcrypt  
✅ **Frontend moderne** avec interface d'authentification  
✅ **API REST** complète pour gérer les heures  

## Pour démarrer l'application

### Option 1: Démarrage en mode production
```bash
npm start
```

### Option 2: Démarrage en mode développement (avec rechargement automatique)
```bash
npm run dev
```

## Accès à l'application

Une fois le serveur démarré, ouvrez votre navigateur:
```
http://localhost:3000
```

## Premiers pas

1. **Créer un compte** (onglet Inscription)
   - Choisissez un nom d'utilisateur unique
   - Entrez une adresse email valide
   - Créez un mot de passe (min 6 caractères)
   - Confirmez le mot de passe

2. **Ajouter vos heures de travail**
   - Remplissez la date
   - Indiquez votre heure de début et fin
   - Entrez votre taux horaire
   - Optionnellement, ajoutez une description

3. **Visualiser vos statistiques**
   - Sélectionnez le mois à afficher
   - Consultez vos heures et salaire totaux
   - Consultez l'historique détaillé

4. **Gestion des entrées**
   - Modifier: Supprimez et recréez l'entrée
   - Supprimer: Cliquez sur le bouton 🗑️

## Architecture du projet

```
calcul-heure/
├── server.js              # Point d'entrée du serveur
├── database.js            # Configuration SQLite
├── middleware.js          # Middleware d'authentification JWT
├── routes/
│   ├── auth.js           # Routes d'authentification
│   └── entries.js        # Routes des heures
├── index.html            # Interface utilisateur
├── index.backup.html     # Sauvegarde de l'ancienne version
├── package.json          # Dépendances npm
├── .env                  # Variables d'environnement
├── .gitignore            # Fichiers à ignorer git
├── README.md             # Documentation complète
└── database.db           # Base de données SQLite (créée au 1er démarrage)
```

## Fonctionnalités

### Gestion des utilisateurs
- ✅ Inscription sécurisée
- ✅ Connexion avec token JWT
- ✅ Mots de passe hashés (bcrypt)
- ✅ Déconnexion complète

### Gestion des heures
- ✅ Ajout d'entrées de travail
- ✅ Suppression d'entrées
- ✅ Modification d'entrées
- ✅ Calcul automatique des salaires
- ✅ Support des horaires de nuit (fin après minuit)
- ✅ Historique par mois

### Base de données
- ✅ Persistance complète des données
- ✅ Données isolées par utilisateur
- ✅ Sauvegarde automatique

## Dépannage

**Le serveur n'accède pas à la BDD?**
```bash
# Vérifier la présence de database.db
dir /b database.db

# Si absent, il sera créé au démarrage du serveur
```

**Port 3000 déjà occupé?**
```bash
# Modifier le port dans .env
PORT=3001
```

**Erreur de token invalide?**
```bash
# Déconnectez-vous et reconnectez-vous
# Effacez le localStorage de votre navigateur
```

## 📚 Documentation complète

Pour plus de détails, consultez le [README.md](README.md)

---

**Application prête à l'emploi! 🎉**
