# Publication mobile Google Play & App Store

Cette branche prépare l'application web pour une publication mobile avec Capacitor.

## Ce qui est déjà prêt

- Projet Android généré dans `android/`
- Projet iOS généré dans `ios/`
- Configuration Capacitor dans `capacitor.config.json`
- Icônes et splash screens générés depuis le logo
- Authentification compatible mobile avec token Bearer
- CORS backend prévu pour Capacitor
- Route de suppression de compte depuis l'app
- Page de confidentialité : `/privacy`
- Intégration AdMob préparée, désactivée par défaut

## 1. Déployer le backend

L'app mobile ne peut pas utiliser `localhost`. Avant de générer une version store,
il faut héberger le backend Node.js avec HTTPS.

Exemple d'URL attendue :

```txt
https://calcul-heures.example.com
```

Sur le serveur, gardez une configuration proche de :

```env
NODE_ENV=production
JWT_SECRET=une_valeur_aleatoire_de_plus_de_32_caracteres
CORS_ORIGINS=capacitor://localhost,ionic://localhost,http://localhost,https://localhost
```

## 2. Configurer l'URL API mobile

Dans `public/js/mobile-config.js`, remplacez :

```js
apiBaseUrl: '',
```

par l'URL HTTPS du backend :

```js
apiBaseUrl: 'https://calcul-heures.example.com',
```

Puis synchronisez :

```bash
npm run mobile:sync
```

## 3. Activer les publicités AdMob

Par défaut, les pubs sont désactivées pour éviter les bugs et les problèmes de
compte AdMob pendant les tests.

À remplacer avant publication :

### Android

Fichier :

```txt
android/app/src/main/res/values/strings.xml
```

Remplacer l'ID de test :

```xml
<string name="admob_app_id">ca-app-pub-3940256099942544~3347511713</string>
```

par l'ID d'application AdMob Android réel.

### iOS

Fichier :

```txt
ios/App/App/Info.plist
```

Remplacer :

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
```

par l'ID d'application AdMob iOS réel.

### Unités de publicité

Fichier :

```txt
public/js/mobile-config.js
```

Remplacer les IDs de bannières :

```js
androidBannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
iosBannerAdUnitId: 'ca-app-pub-3940256099942544/2934735716'
```

puis activer :

```js
enabled: true,
testMode: false,
```

Important : pendant le développement, utiliser les IDs de test Google. Cliquer
sur ses propres vraies pubs peut faire bloquer le compte AdMob.

## 4. Générer Android pour Google Play

Prérequis :

- Android Studio
- JDK compatible avec le projet Android généré
- Compte Google Play Console

Ouvrir le projet :

```bash
npm run mobile:open:android
```

Dans Android Studio :

1. Vérifier `applicationId` : `com.fivehosting.calculheures`
2. Configurer la signature de release
3. Générer un Android App Bundle `.aab`
4. L'envoyer dans Google Play Console

À remplir dans Google Play Console :

- fiche store
- captures d'écran
- politique de confidentialité
- formulaire Data Safety
- classification du contenu
- compte de test si demandé
- test fermé si le compte développeur Google l'exige

## 5. Générer iOS pour l'App Store

Prérequis :

- Mac
- Xcode
- Compte Apple Developer

Ouvrir le projet :

```bash
npm run mobile:open:ios
```

Dans Xcode :

1. Vérifier le Bundle Identifier : `com.fivehosting.calculheures`
2. Configurer l'équipe Apple Developer
3. Choisir le signing release
4. Archiver l'app
5. Envoyer vers App Store Connect

À remplir dans App Store Connect :

- fiche App Store
- captures d'écran iPhone
- politique de confidentialité
- informations de confidentialité
- compte de test si demandé
- explication de la connexion

## 6. Points de validation importants

- L'API doit être en HTTPS.
- L'app ne doit pas dépendre de `localhost`.
- Le bouton de suppression de compte doit rester accessible depuis l'app.
- La politique de confidentialité doit contenir un vrai email de contact.
- Les vrais IDs AdMob doivent remplacer les IDs de test avant publication.
- Les pubs doivent rester discrètes : bannière en bas uniquement.
- Tester une vraie connexion sur téléphone avant d'envoyer aux stores.

## Sources utiles

- Capacitor : https://capacitorjs.com/docs/getting-started
- Capacitor Android : https://capacitorjs.com/docs/android
- Capacitor iOS : https://capacitorjs.com/docs/ios
- Capacitor Ads / AdMob : https://capacitorjs.com/docs/guides/ads
- Plugin AdMob : https://github.com/capacitor-community/admob
- Google Play Console : https://play.google.com/console
- Google Play Data Safety : https://support.google.com/googleplay/android-developer/answer/10787469
- Apple App Review Guidelines : https://developer.apple.com/app-store/review/guidelines/
