#!/bin/bash
# Script de déploiement automatique pour Calculateur d'Heures v2.0 sur VestaCP
# Usage: bash deploy-vestacp.sh

set -e  # Arrêter si erreur

echo "════════════════════════════════════════════════════════════"
echo "🚀 DÉPLOIEMENT CALCULATEUR D'HEURES v2.0 - VestaCP"
echo "════════════════════════════════════════════════════════════"
echo ""

# Vérifier les droits root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Ce script doit être exécuté en tant que root"
  exit 1
fi

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/home/admin/calcul-heure"
APP_PORT=3000
APP_NAME="calcul-heure"

echo "📋 Configuration:"
echo "   Dossier:   $APP_DIR"
echo "   Port:      $APP_PORT"
echo "   Nom:       $APP_NAME"
echo ""

# Étape 1: Vérifier Node.js
echo "🔍 Étape 1/6: Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js n'est pas installé. Installation en cours...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js installé${NC}"
else
    echo -e "${GREEN}✅ Node.js trouvé: $(node --version)${NC}"
fi

# Étape 2: Vérifier PM2
echo ""
echo "🔍 Étape 2/6: Vérification de PM2..."
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé. Installation en cours...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 installé${NC}"
else
    echo -e "${GREEN}✅ PM2 trouvé: $(pm2 --version)${NC}"
fi

# Étape 3: Créer le dossier et permissions
echo ""
echo "📁 Étape 3/6: Création du dossier application..."
if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    echo -e "${GREEN}✅ Dossier créé: $APP_DIR${NC}"
else
    echo -e "${GREEN}✅ Dossier existe déjà: $APP_DIR${NC}"
fi

# Vérifier les fichiers de l'app
echo ""
echo "📦 Étape 4/6: Vérification des fichiers..."
if [ ! -f "$APP_DIR/package.json" ]; then
    echo -e "${RED}❌ package.json non trouvé dans $APP_DIR${NC}"
    echo "   Assurez-vous que tous les fichiers de l'app sont dans: $APP_DIR"
    exit 1
fi
echo -e "${GREEN}✅ Fichiers présents${NC}"

# Installer les dépendances
echo ""
echo "📚 Étape 5/6: Installation des dépendances npm..."
cd "$APP_DIR"
npm install
echo -e "${GREEN}✅ Dépendances installées${NC}"

# Vérifier .env
echo ""
echo "⚙️  Étape 6/6: Vérification du fichier .env..."
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${RED}❌ .env non trouvé${NC}"
    echo "   Créer le fichier .env avec:"
    echo "   JWT_SECRET=votre_clé_secrète"
    echo "   PORT=$APP_PORT"
    echo "   NODE_ENV=production"
    exit 1
fi

# Lire le JWT_SECRET du .env
JWT_SECRET=$(grep "JWT_SECRET" "$APP_DIR/.env" | cut -d '=' -f 2)
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "votre_clé_secrète_très_sûre_à_changer_en_production" ]; then
    echo -e "${YELLOW}⚠️  JWT_SECRET par défaut (risqué!)${NC}"
    read -p "   Voulez-vous générer une clé sécurisée? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        NEW_SECRET=$(openssl rand -base64 32)
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_SECRET/" "$APP_DIR/.env"
        echo -e "${GREEN}✅ Nouvelle clé JWT générée${NC}"
    fi
fi
echo -e "${GREEN}✅ Configuration .env OK${NC}"

# PM2 Setup
echo ""
echo "🔄 Configuration PM2..."

# Arrêter l'app si elle tourne déjà
if pm2 describe "$APP_NAME" 2>/dev/null | grep -q "online\|stopped"; then
    echo "   Arrêt de l'application existante..."
    pm2 delete "$APP_NAME"
fi

# Démarrer l'app
cd "$APP_DIR"
pm2 start server.js --name "$APP_NAME" --env production

# Enregistrer pour redémarrage auto
pm2 startup systemd -u admin --hp /home/admin
pm2 save

echo -e "${GREEN}✅ PM2 configuré${NC}"

# Résumé
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DÉPLOIEMENT RÉUSSI!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📊 Informations:"
echo "   Application: $APP_NAME"
echo "   Dossier:     $APP_DIR"
echo "   Port:        $APP_PORT"
echo "   Statut:      $(pm2 describe $APP_NAME | grep -o 'online')"
echo ""
echo "🔍 Vérifications:"
echo "   pm2 status                    # Voir l'état"
echo "   pm2 logs $APP_NAME            # Voir les logs"
echo "   pm2 restart $APP_NAME         # Redémarrer"
echo "   pm2 delete $APP_NAME          # Arrêter"
echo ""
echo "🌐 Configuration Nginx requise:"
echo "   Consulter le README.md pour la configuration Nginx"
echo ""
echo "📞 Support:"
echo "   Aide: README.md section 'DÉPLOIEMENT SUR VPS'"
echo "   Guide: VESTACP-GUIDE.md"
echo ""
