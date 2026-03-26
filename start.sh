#!/bin/bash
# Script de démarrage rapide pour le Calculateur d'Heures v2.0

echo "🚀 Démarrage du Calculateur d'Heures v2.0..."
echo ""

# Vérifier si node est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Node.js détecté: $(node --version)"
echo "✅ npm détecté: $(npm --version)"
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

echo "🌐 Démarrage du serveur..."
echo ""
echo "📍 L'application sera accessible sur:"
echo "   http://localhost:3000"
echo ""
echo "👤 Données de test:"
echo "   Vous pouvez créer un compte avec n'importe quel username/email"
echo ""
echo "⏹️  Pour arrêter le serveur: CTRL+C"
echo ""

npm start
